// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TroveManager.sol";
import "./ZUSD.sol";

contract BorrowOperations is Ownable {

    TroveManager public troveManager;
    ZUSD public zusd;
    AggregatorV3Interface internal priceFeed;

    constructor(address _troveManagerAddress) {
        troveManager = TroveManager(_troveManagerAddress);
    }

    function setAddresses(address _zusdAddress, address _priceFeedAddress) external onlyOwner {
        zusd = ZUSD(_zusdAddress);
        priceFeed = AggregatorV3Interface(_priceFeedAddress); // price feed for USD/ETH
    }

    /**
     * @notice Specify the amount of ZUSD to borrow (ZUSD has 18 decimals)
     * @notice The amount of ETH attached is the collateral provided
     */
    function openTrove(uint zusdAmount) external payable  {
        // check that collateral provided is sufficient
        uint256 minETHAmount = zusdAmount * uint256(getLatestPrice()) / (10**priceFeed.decimals());
        require(msg.value >= minETHAmount, "BorrowerOps: Insufficient ETH provided");

        // send ETH to trove manager
        (bool success, ) = address(troveManager).call{value: zusdAmount}("");
        require(success, "BorrowerOps: Sending ETH to TroveManager failed");
        
        // mint zusd and transfer to user
        zusd.mint(msg.sender, zusdAmount);
    }

    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

}