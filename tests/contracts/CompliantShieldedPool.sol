// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {MerkleTreeForBlocklist} from "@zrclib/sdk/contracts/MerkleTreeForBlocklist.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CompliantShieldedPool is MerkleTreeForBlocklist {
    constructor(
        address _verifier
    ) MerkleTreeForBlocklist(5, _verifier) {}
}