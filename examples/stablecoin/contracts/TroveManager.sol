// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StabilityPool.sol";
import "./ZUSD.sol";

contract TroveManager is Ownable {

    AggregatorV3Interface internal priceFeed;
    StabilityPool public stabilityPool;
    ZUSD public zusd;

    uint256 public minCollaterizationRatio = 120; // 120%
    uint256 public collateraizationScaleFactor = 100;

    // Store the necessary data for a trove
    struct Trove {
        uint256 debt; // debt denominated in ZUSD
        uint256 coll; // collateral denominated in ETH
    }

    mapping (address => Trove) public troves;

    function setAddresses(
        address _zusdAddress, 
        address payable _stabilityPoolAddress, 
        address _priceFeedAddress
    ) external onlyOwner {
        zusd = ZUSD(_zusdAddress);
        stabilityPool = StabilityPool(_stabilityPoolAddress);
        priceFeed = AggregatorV3Interface(_priceFeedAddress); // price feed for USD/ETH
    }

    /**
     * @notice Specify the amount of ZUSD to borrow (ZUSD has 18 decimals)
     * @notice The amount of ETH attached is the collateral provided
     */
    function openTrove(uint zusdAmount) external payable  {
        // check that collateral provided is sufficient
        uint256 maxZUSDAmount = msg.value * uint256(getLatestPrice()) * minCollaterizationRatio / collateraizationScaleFactor / (10**priceFeed.decimals());
        require(zusdAmount < maxZUSDAmount, "TroveManager: Insufficient ETH provided");

        // record trove and its collateral and debt
        Trove storage trove = troves[msg.sender];
        trove.debt += zusdAmount;
        trove.coll += msg.value;

        // send ETH to trove manager
        (bool success, ) = address(this).call{value: msg.value}("");
        require(success, "TroveManager: Sending ETH to TroveManager failed");
        
        // mint zusd and transfer to user
        zusd.mint(msg.sender, zusdAmount);
    }

    function liquidate(address _borrower) external {
        // check if the trove is undercollateralized
        Trove storage trove = troves[_borrower];
        uint256 minETHAmount = trove.debt * uint256(getLatestPrice()) * minCollaterizationRatio / collateraizationScaleFactor / (10**priceFeed.decimals());
        require(trove.coll < minETHAmount, "TroveManager: Trove is not undercollateralized");

        // update trove and its collateral and debt
        trove.debt = 0;
        trove.coll = 0;

        // call offset function in stability pool
        stabilityPool.offset(trove.debt, trove.coll); // TODO: check whether parameters passed are correct

        // TODO: transfer a liquidation premium to liquidator
    }

    /**
     * @notice Send ZUSD to the trove manager to redeem ETH
     */
    function redeemCollateral(uint256 zusdAmount, uint256 ethAmount, uint256 collaterizationRatio) external {
        // make sure that collaterization ratio is always above the minimum
        require(collaterizationRatio >= minCollaterizationRatio, "TroveManager: Collaterization ratio is below the minimum");
        // maintain the minimum collaterization ratio specified by users
        Trove storage trove = troves[msg.sender];
        uint256 maxZUSDAmount = (trove.coll - ethAmount) * uint256(getLatestPrice()) * collaterizationRatio / collateraizationScaleFactor / (10**priceFeed.decimals());
        require(trove.debt - zusdAmount < maxZUSDAmount, "TroveManager: Insufficient ZUSD provided");
        trove.debt -= zusdAmount;
        trove.coll -= ethAmount;
        // TODO: figure out what to do with the returned ZUSD
    }

    function _requireCallerIsStabilityPool() internal view {
        require(msg.sender == address(stabilityPool), "LUSDToken: Caller is not StabilityPool");
    }

    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function sendETH(address to, uint256 amount) public {
        _requireCallerIsStabilityPool();
        (bool success, ) = to.call{value: amount}("");
        require(success, "TroveManager: Sending ETH failed");
    }

    receive() external payable {}
}