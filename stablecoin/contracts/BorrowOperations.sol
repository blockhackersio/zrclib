// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./TroveManager.sol";

contract BorrowOperations {

    TroveManager public troveManager;

    constructor(address _troveManagerAddress) {
        troveManager = TroveManager(_troveManagerAddress);
    }

    function openTrove(uint zusdAmount) external payable  {
        // TODO: check that collateral provided is sufficient
        // TODO: mint zusd and transfer to user
    }

}