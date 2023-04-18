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

    enum Status {
        nonExistent,
        active,
        closedByOwner,
        closedByLiquidation,
        closedByRedemption
    }

    // Store the necessary data for a trove
    struct Trove {
        uint256 debt; // debt denominated in ZUSD
        uint256 coll; // collateral denominated in ETH
        Status status;
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

        // TODO: record trove and its status

        // send ETH to trove manager
        (bool success, ) = address(this).call{value: msg.value}("");
        require(success, "TroveManager: Sending ETH to TroveManager failed");
        
        // mint zusd and transfer to user
        zusd.mint(msg.sender, zusdAmount);
    }

    function liquidate(address _borrower) external {
        _requireTroveIsActive(_borrower);

        // check if the trove is undercollateralized
        Trove memory trove = troves[_borrower];
        uint256 minETHAmount = trove.debt * uint256(getLatestPrice()) * minCollaterizationRatio / collateraizationScaleFactor / (10**priceFeed.decimals());
        require(trove.coll < minETHAmount, "TroveManager: Trove is not undercollateralized");

        // call offset function in stability pool
        stabilityPool.offset(trove.debt, trove.coll); // TODO: check whether parameters passed are correct

        // TODO: update trove and its status
        // TODO: transfer a liquidation premium to liquidator
    }

    /**
     * @notice Send ZUSD to the trove manager to redeem ETH
     */
    function redeemCollateral(uint256 zusdAmount) external {
        // TODO: make sure that collaterization ratio is always above the minimum
        // TODO: maintain the minimum collaterization ratio specified by users
        // TODO: update trove struct
    }

    function _requireTroveIsActive(address _borrower) internal view {
        require(troves[_borrower].status == Status.active, "TroveManager: Trove does not exist or is closed");
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