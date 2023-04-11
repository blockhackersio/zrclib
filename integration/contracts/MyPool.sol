// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@zrclib/tools/contracts/ZRC20.sol";

contract MyPool is ZRC20 {
    constructor() ZRC20("MyPool", "MP") {}
}
