// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./TroveManager.sol";

contract StabilityPool {

    TroveManager public troveManager;

    struct Snapshots {
        uint S;
        uint P;
    }

    mapping (address => uint256) public deposits;
    mapping (address => Snapshots) public depositSnapshots;  // depositor address -> snapshots struct

    constructor(address _troveManagerAddress) {
        troveManager = TroveManager(_troveManagerAddress);
    }

    function provideLiquidity(uint256 amount) external {
        // TODO: update accounting
        // TODO: transfer ZUSD from user to StabilityPool
    }

    function withdrawLiquidity(uint256 amount) external {
        // TODO: update accounting
        // TODO: transfer ZUSD from StabilityPool to user
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

}