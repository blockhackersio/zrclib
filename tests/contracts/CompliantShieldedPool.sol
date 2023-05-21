// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ShieldedPoolWithBlocklist} from "@zrclib/sdk/contracts/ShieldedPoolWithBlocklist.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CompliantShieldedPool is ShieldedPoolWithBlocklist {
    constructor(
        address _hasher,
        address _transactionVerifier,
        address _blocklistVerifier,
        address _swapExecutor
    ) ShieldedPoolWithBlocklist(5, _hasher, _transactionVerifier, _blocklistVerifier, _swapExecutor) {}
}