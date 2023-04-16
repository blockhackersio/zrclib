// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@zrclib/tools/contracts/ZRC20.sol";

contract MyPool is ZRC20 {

    constructor(
        address hasherAddress
    ) ZRC20("MyPool", "MP", 5, hasherAddress) {}

    function mint(uint256 amount, Proof calldata proof) public {
        _mint(amount, proof);
    }

    function transfer(Proof calldata proof) public {
        _transfer(proof);
    }

    function burn(uint256 amount, Proof calldata proof) public {
        _burn(amount, proof);
    }
}
