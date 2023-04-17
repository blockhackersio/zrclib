// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StabilityPool.sol";

contract TroveManager is Ownable {

    AggregatorV3Interface internal priceFeed;
    StabilityPool public stabilityPool;

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

    function setAddresses(address _stabilityPoolAddress, address _priceFeedAddress) external onlyOwner {
        stabilityPool = StabilityPool(_stabilityPoolAddress);
        priceFeed = AggregatorV3Interface(_priceFeedAddress); // price feed for USD/ETH
    }

    function liquidate(address _borrower) external {
        _requireTroveIsActive(_borrower);

        // check if the trove is undercollateralized
        Trove memory trove = troves[_borrower];
        uint256 minETHAmount = trove.debt * uint256(getLatestPrice()) * minCollaterizationRatio / collateraizationScaleFactor / (10**priceFeed.decimals());
        require(trove.coll < minETHAmount, "TroveManager: Trove is not undercollateralized");

        // TODO: transfer ETH in trove to stability pool and call liquidate function
        (bool success, ) = address(stabilityPool).call{value: trove.coll}("");
        require(success, "TroveManager: Sending ETH to StabilityPool failed");
        // TODO: transfer a liquidation premium to liquidator
    }

    /**
     * @notice Send ZUSD to the trove manager to redeem ETH
     */
    function redeemCollateral(uint256 zusdAmount) external {
        // TODO: make sure that collaterization ratio is always above the minimum
        // TODO: maintain the minimum collaterization ratio specified by users
    }

    function _requireTroveIsActive(address _borrower) internal view {
        require(troves[_borrower].status == Status.active, "TroveManager: Trove does not exist or is closed");
    }

    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }
}