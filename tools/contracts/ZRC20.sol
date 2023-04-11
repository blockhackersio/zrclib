// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./transaction_verifier.sol";

contract ZRC20 is TransactionVerifier {
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }
}
