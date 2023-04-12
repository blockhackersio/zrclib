// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {TransactionVerifier} from "./generated/TransactionVerifier.sol";

contract ZRC20 is TransactionVerifier {
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function _mint(
        uint256 amount,
        bytes memory proof,
        uint[] memory pubSignals
    ) public {
        require(verifyProof(proof, pubSignals), "Invalid proof");
    }
}
