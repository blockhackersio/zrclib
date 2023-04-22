// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./TroveManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StabilityPool is Ownable {

    TroveManager public troveManager;
    ZUSD public zusd;

    struct Snapshots {
        uint S;
        uint P;
        uint128 scale;
        uint128 epoch;
    }

    mapping (address => uint256) public deposits; // depositor addresss -> initial deposit
    mapping (address => Snapshots) public depositSnapshots;  // depositor address -> snapshots struct

    uint public P = DECIMAL_PRECISION;
    uint public constant DECIMAL_PRECISION = 1e18;
    uint public constant SCALE_FACTOR = 1e9;
    // Each time the scale of P shifts by SCALE_FACTOR, the scale is incremented by 1
    uint128 public currentScale;
    // With each offset that fully empties the Pool, the epoch is incremented by 1
    uint128 public currentEpoch;
    // Error trackers for the error correction in the offset calculation
    uint public lastETHError_Offset;
    uint public lastZUSDLossError_Offset;

    uint256 public totalLiquidity;

    /* ETH Gain sum 'S': During its lifetime, each deposit d_t earns an ETH gain of ( d_t * [S - S_t] )/P_t, where S_t
    * is the depositor's snapshot of S taken at the time t when the deposit was made.
    *
    * The 'S' sums are stored in a nested mapping (epoch => scale => sum):
    *
    * - The inner mapping records the sum S at different scales
    * - The outer mapping records the (scale => sum) mappings, for different epochs.
    */
    mapping (uint128 => mapping(uint128 => uint)) public epochToScaleToSum;

    constructor(address payable _troveManagerAddress) {
        troveManager = TroveManager(_troveManagerAddress);
    }

    function setZUSDAddress(address _zusdAddress) public onlyOwner {
        zusd = ZUSD(_zusdAddress);
    }

    function provideLiquidity(uint256 amount) external {
        uint depositorETHGain = getDepositorETHGain(msg.sender);
        uint compoundedLUSDDeposit = getCompoundedZUSDDeposit(msg.sender);

        // transfer zusd to pool
        totalLiquidity += amount;
        zusd.transferFrom(msg.sender, address(this), amount);

        // update deposit state parameters
        uint newDeposit = compoundedLUSDDeposit + amount;
        _updateDepositAndSnapshots(msg.sender, newDeposit);

        // transfer ETH gain to depositors (if any)
        (bool success, ) = (msg.sender).call{value: depositorETHGain}("");
        require(success, "StabilityPool: Sending ETH to liquidity provider failed");
    }

    function withdrawLiquidity(uint256 amount) external {
        uint initialDeposit = deposits[msg.sender];
        require(initialDeposit > 0, 'StabilityPool: User must have a non-zero deposit');

        uint depositorETHGain = getDepositorETHGain(msg.sender);
        uint compoundedZUSDDeposit = getCompoundedZUSDDeposit(msg.sender);
        uint ZUSDtoWithdraw = (amount < compoundedZUSDDeposit) ? amount : compoundedZUSDDeposit;

        totalLiquidity -= ZUSDtoWithdraw;
        zusd.transfer(msg.sender, ZUSDtoWithdraw);

        // Update deposit
        uint newDeposit = compoundedZUSDDeposit - ZUSDtoWithdraw;
        _updateDepositAndSnapshots(msg.sender, newDeposit);

        // transfer ETH gain to depositors (if any)
        (bool success, ) = (msg.sender).call{value: depositorETHGain}("");
        require(success, "StabilityPool: Sending ETH to liquidity provider failed");
    }

    /*
    * Cancels out the specified debt against the ZUSD contained in the Stability Pool (as far as possible)
    * and transfers the Trove's ETH collateral from ActivePool to StabilityPool.
    * Only called by liquidation functions in the TroveManager.
    */
    function offset(uint _debtToOffset, uint _collToAdd) external {
        _requireCallerIsTroveManager();
        uint totalZUSD = totalLiquidity; // cached to save an SLOAD
        if (totalZUSD == 0 || _debtToOffset == 0) { return; }

        (uint ETHGainPerUnitStaked,
            uint ZUSDLossPerUnitStaked) = _computeRewardsPerUnitStaked(_collToAdd, _debtToOffset, totalZUSD);

        _updateRewardSumAndProduct(ETHGainPerUnitStaked, ZUSDLossPerUnitStaked);  // updates S and P

        _moveOffsetCollAndDebt(_collToAdd, _debtToOffset);
    }

    function getDepositorETHGain(address _depositor) public view returns (uint) {
        uint initialDeposit = deposits[_depositor];
        if (initialDeposit == 0) { return 0; }

        Snapshots memory snapshots = depositSnapshots[_depositor];

        uint ETHGain = _getETHGainFromSnapshots(initialDeposit, snapshots);
        return ETHGain;
    }

    function _getETHGainFromSnapshots(uint initialDeposit, Snapshots memory snapshots) internal view returns (uint) {
        /*
        * Grab the sum 'S' from the epoch at which the stake was made. The ETH gain may span up to one scale change.
        * If it does, the second portion of the ETH gain is scaled by 1e9.
        * If the gain spans no scale change, the second portion will be 0.
        */
        uint128 epochSnapshot = snapshots.epoch;
        uint128 scaleSnapshot = snapshots.scale;
        uint S_Snapshot = snapshots.S;
        uint P_Snapshot = snapshots.P;

        uint firstPortion = epochToScaleToSum[epochSnapshot][scaleSnapshot] - S_Snapshot;
        uint secondPortion = epochToScaleToSum[epochSnapshot][scaleSnapshot + 1] / SCALE_FACTOR;

        uint ETHGain = initialDeposit * (firstPortion + secondPortion) / P_Snapshot / DECIMAL_PRECISION;

        return ETHGain;
    }

    function getCompoundedZUSDDeposit(address _depositor) public view returns (uint) {
        uint initialDeposit = deposits[_depositor];
        if (initialDeposit == 0) { return 0; }

        Snapshots memory snapshots = depositSnapshots[_depositor];

        uint compoundedDeposit = _getCompoundedStakeFromSnapshots(initialDeposit, snapshots);
        return compoundedDeposit;
    }

    // Internal function, used to calculcate compounded deposits and compounded front end stakes.
    function _getCompoundedStakeFromSnapshots(uint initialStake, Snapshots memory snapshots) internal view returns (uint) {
        uint snapshot_P = snapshots.P;
        uint128 scaleSnapshot = snapshots.scale;
        uint128 epochSnapshot = snapshots.epoch;

        // If stake was made before a pool-emptying event, then it has been fully cancelled with debt -- so, return 0
        if (epochSnapshot < currentEpoch) { return 0; }

        uint compoundedStake;
        uint128 scaleDiff = currentScale - scaleSnapshot;

        /* Compute the compounded stake. If a scale change in P was made during the stake's lifetime,
        * account for it. If more than one scale change was made, then the stake has decreased by a factor of
        * at least 1e-9 -- so return 0.
        */
        if (scaleDiff == 0) {
            compoundedStake = initialStake * P / snapshot_P;
        } else if (scaleDiff == 1) {
            compoundedStake = initialStake * P / snapshot_P / SCALE_FACTOR;
        } else { // if scaleDiff >= 2
            compoundedStake = 0;
        }

        /*
        * If compounded deposit is less than a billionth of the initial deposit, return 0.
        *
        * NOTE: originally, this line was in place to stop rounding errors making the deposit too large. However, the error
        * corrections should ensure the error in P "favors the Pool", i.e. any given compounded deposit should slightly less
        * than it's theoretical value.
        *
        * Thus it's unclear whether this line is still really needed.
        */
        if (compoundedStake < initialStake / 1e9) {return 0;}

        return compoundedStake;
    }

    function _updateDepositAndSnapshots(address _depositor, uint _newValue) internal {
        deposits[_depositor] = _newValue;

        if (_newValue == 0) {
            delete depositSnapshots[_depositor];
            return;
        }
        uint128 currentScaleCached = currentScale;
        uint128 currentEpochCached = currentEpoch;
        uint currentP = P;

        // Get S for the current epoch and current scale
        uint currentS = epochToScaleToSum[currentEpochCached][currentScaleCached];

        // Record new snapshots of the latest running product P, sum S, for the depositor
        depositSnapshots[_depositor].P = currentP;
        depositSnapshots[_depositor].S = currentS;
        depositSnapshots[_depositor].scale = currentScaleCached;
        depositSnapshots[_depositor].epoch = currentEpochCached;
    }

    function _requireCallerIsTroveManager() internal view {
        require(msg.sender == address(troveManager), "StabilityPool: Caller is not TroveManager");
    }

    function _computeRewardsPerUnitStaked(
        uint _collToAdd,
        uint _debtToOffset,
        uint _totalZUSDDeposits
    ) internal returns (uint ETHGainPerUnitStaked, uint ZUSDLossPerUnitStaked) {
        /*
        * Compute the LUSD and ETH rewards. Uses a "feedback" error correction, to keep
        * the cumulative error in the P and S state variables low:
        *
        * 1) Form numerators which compensate for the floor division errors that occurred the last time this 
        * function was called.  
        * 2) Calculate "per-unit-staked" ratios.
        * 3) Multiply each ratio back by its denominator, to reveal the current floor division error.
        * 4) Store these errors for use in the next correction when this function is called.
        * 5) Note: static analysis tools complain about this "division before multiplication", however, it is intended.
        */
        uint ETHNumerator = _collToAdd * DECIMAL_PRECISION + lastETHError_Offset;

        assert(_debtToOffset <= _totalZUSDDeposits);
        if (_debtToOffset == _totalZUSDDeposits) {
            ZUSDLossPerUnitStaked = DECIMAL_PRECISION;  // When the Pool depletes to 0, so does each deposit 
            lastZUSDLossError_Offset = 0;
        } else {
            uint ZUSDLossNumerator = _debtToOffset * DECIMAL_PRECISION - lastZUSDLossError_Offset;
            /*
            * Add 1 to make error in quotient positive. We want "slightly too much" LUSD loss,
            * which ensures the error in any given compoundedLUSDDeposit favors the Stability Pool.
            */
            ZUSDLossPerUnitStaked = ZUSDLossNumerator / _totalZUSDDeposits + 1;
            lastZUSDLossError_Offset = ZUSDLossPerUnitStaked * _totalZUSDDeposits - ZUSDLossNumerator;
        }

        ETHGainPerUnitStaked = ETHNumerator / _totalZUSDDeposits;
        lastETHError_Offset = ETHNumerator - (ETHGainPerUnitStaked * _totalZUSDDeposits);

        return (ETHGainPerUnitStaked, ZUSDLossPerUnitStaked);
    }

    // Update the Stability Pool reward sum S and product P
    function _updateRewardSumAndProduct(uint _ETHGainPerUnitStaked, uint _ZUSDLossPerUnitStaked) internal {
        uint currentP = P;
        uint newP;

        assert(_ZUSDLossPerUnitStaked <= DECIMAL_PRECISION);
        /*
        * The newProductFactor is the factor by which to change all deposits, due to the depletion of Stability Pool LUSD in the liquidation.
        * We make the product factor 0 if there was a pool-emptying. Otherwise, it is (1 - LUSDLossPerUnitStaked)
        */
        uint newProductFactor = uint(DECIMAL_PRECISION) - _ZUSDLossPerUnitStaked;

        uint128 currentScaleCached = currentScale;
        uint128 currentEpochCached = currentEpoch;
        uint currentS = epochToScaleToSum[currentEpochCached][currentScaleCached];

        /*
        * Calculate the new S first, before we update P.
        * The ETH gain for any given depositor from a liquidation depends on the value of their deposit
        * (and the value of totalDeposits) prior to the Stability being depleted by the debt in the liquidation.
        *
        * Since S corresponds to ETH gain, and P to deposit loss, we update S first.
        */
        uint marginalETHGain = _ETHGainPerUnitStaked * currentP;
        uint newS = currentS + marginalETHGain;
        epochToScaleToSum[currentEpochCached][currentScaleCached] = newS;

        // If the Stability Pool was emptied, increment the epoch, and reset the scale and product P
        if (newProductFactor == 0) {
            currentEpoch = currentEpochCached + 1;
            currentScale = 0;
            newP = DECIMAL_PRECISION;

        // If multiplying P by a non-zero product factor would reduce P below the scale boundary, increment the scale
        } else if (currentP * newProductFactor / DECIMAL_PRECISION < SCALE_FACTOR) {
            newP = currentP * newProductFactor * SCALE_FACTOR / DECIMAL_PRECISION; 
            currentScale = currentScaleCached + 1;
        } else {
            newP = currentP * newProductFactor / DECIMAL_PRECISION;
        }

        assert(newP > 0);
        P = newP;
    }

    function _moveOffsetCollAndDebt(uint _collToAdd, uint _debtToOffset) internal {
        // Burn the debt that was successfully offset
        zusd.burn(address(this), _debtToOffset);

        // send ETH from trove manager to liquidity pool
        troveManager.sendETH(address(this), _collToAdd);
    }

    receive() external payable {}

}