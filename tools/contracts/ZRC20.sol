// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { TransactionVerifier } from "./transaction_verifier.sol";

contract ZRC20 {
    string private _name;
    string private _symbol;
    TransactionVerifier public verifier;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        verifier = TransactionVerifier(0xA836380122e58Dff60D3404d8994671b0eF6CCd8);
    }

    function mint(uint256 amount, bytes memory proof, uint[] memory pubSignals) public virtual {
        require(verifier.verifyProof(proof, pubSignals), "Invalid proof");
    }
}
