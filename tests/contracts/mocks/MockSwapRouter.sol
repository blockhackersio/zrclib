// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { MockErc20 } from "./MockErc20.sol";

contract MockSwapRouter {

    function swap(address tokenInAddress, address tokenOutAddress, uint256 amount) public {
        // we naively assume that swap price of tokenIn:tokenOut is 1:1, just for testing purposes
        MockErc20 tokenIn = MockErc20(tokenInAddress);
        MockErc20 tokenOut = MockErc20(tokenOutAddress);

        require(tokenOut.balanceOf(address(this)) >= amount, "SwapRouter: Insufficient liquidity");

        tokenIn.transferFrom(msg.sender, address(this), amount);
        tokenOut.transfer(msg.sender, amount);
    }
}
