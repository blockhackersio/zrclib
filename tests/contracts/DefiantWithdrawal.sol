// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ShieldedPool} from "@zrclib/sdk/contracts/ShieldedPool.sol";
import {DefiantPool} from "./DefiantPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DefiantWithdrawal {
    address immutable pool;
    address immutable token;

    constructor(address _pool, address _token) {
        token = _token;
        pool = _pool;
    }

    function withdraw(ShieldedPool.Proof calldata _proof) external {
        // Forward proof to pool
        DefiantPool(pool).withdraw(_proof);
    }
}
