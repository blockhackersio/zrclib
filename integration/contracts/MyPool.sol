// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@zrclib/tools/contracts/ZRC20.sol";

contract MyPool is ZRC20 {
    uint256 public mintedAmount;

    constructor() ZRC20("MyPool", "MP") {}

    function mint(
        uint256 amount,
        bytes memory proof,
        uint[] memory pubSignals
    ) public {
        _mint(amount, proof, pubSignals);
        mintedAmount += amount;
    }
}
