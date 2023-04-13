// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@zrclib/tools/contracts/ZRC20.sol";

contract MyPool is ZRC20 {
    uint256 public mintedAmount;

    constructor(address hasherAddress) ZRC20("MyPool", "MP", 5, hasherAddress) {}

    function mint(
        uint256 amount,
        Proof memory proof
    ) public {
        _mint(amount, proof);
        mintedAmount += amount;
    }
}
