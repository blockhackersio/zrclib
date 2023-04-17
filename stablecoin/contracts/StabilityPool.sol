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
    }

    mapping (address => uint256) public deposits;
    mapping (address => Snapshots) public depositSnapshots;  // depositor address -> snapshots struct

    constructor(address payable _troveManagerAddress) {
        troveManager = TroveManager(_troveManagerAddress);
    }

    function setZUSDAddress(address _zusdAddress) public onlyOwner {
        zusd = ZUSD(_zusdAddress);
    }

    function provideLiquidity(uint256 amount) external {
        // TODO: update accounting
        deposits[msg.sender] += amount;
        // transfer ZUSD from user to StabilityPool
        zusd.transferFrom(msg.sender, address(this), amount);
    }

    function withdrawLiquidity(uint256 amount) external {
        // TODO: update accounting
        // transfer ZUSD from StabilityPool to user
        require(deposits[msg.sender] >= amount, "StabilityPool: Withdraw amount larger than deposit");
        deposits[msg.sender] -= amount;
        zusd.transfer(msg.sender, amount);
    }

    /*
    * Cancels out the specified debt against the ZUSD contained in the Stability Pool (as far as possible)
    * and transfers the Trove's ETH collateral from ActivePool to StabilityPool.
    * Only called by liquidation functions in the TroveManager.
    */
    function offset(uint _debtToOffset, uint _collToAdd) external {
        // TODO: make sure it's only callable by Trove manager
        // TODO: Update the value of P and S
    }

    receive() external payable {}

}