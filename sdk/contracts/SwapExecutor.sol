// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ShieldedPool.sol";
import "hardhat/console.sol";

// This contract is used to execute external swap, leading to an arbitrary external call.
// It should never hold any funds, get any token allowance, or manage any contracts.
contract SwapExecutor {
    using SafeERC20 for IERC20;

    function executeSwap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin,
        address _swapRouter,
        address _swapRecipient,
        bytes calldata _swapData,
        bytes calldata _transactData
    ) external {
        // TODO: check msg.sender is ShieldedPool to improve security
        IERC20(_tokenIn).safeApprove(_swapRouter, 0);
        IERC20(_tokenIn).safeApprove(_swapRouter, _amountIn);
        {
            (bool success, ) = _swapRouter.call(_swapData); // deadline limit should be included in _swapData to prevent relayers hold tx for MEV
            require(success, "SwapExecutor: swap failed");
        }

        console.log("Breakpoint1");

        // The transfer can also be done in the swap router directly, but we do it here because we want to enable re-shield feature later.
        uint256 amountOut = IERC20(_tokenOut).balanceOf(address(this));
        require(
            amountOut >= _amountOutMin,
            "SwapExecutor: received less than expected"
        );

        // if _swapRecipient is zero, we should re-shield the token.
        // if _swapRecipient is not zero, we should transfer the token to _swapRecipient.
        if (_swapRecipient == address(0)) {
            console.log("Breakpoint2");
            // re-shield token
            // user should generate proof in advance
            (
                ShieldedPool.ProofArguments memory _args,
                ShieldedPool.ExtData memory _extData
            ) = abi.decode(
                    _transactData,
                    (ShieldedPool.ProofArguments, ShieldedPool.ExtData)
                );
            console.log("Breakpoint3");
            IERC20(_tokenOut).safeApprove(msg.sender, 0);
            IERC20(_tokenOut).safeApprove(msg.sender, _amountOutMin);
            console.log("Breakpoint4");
            ShieldedPool(msg.sender).transact(
                ShieldedPool.Proof(_args, _extData)
            );
            console.log("Breakpoint5");
            // TODO: there would be some changes in the swap, we transfer it to tx.origin to reward relayer.
        } else {
            // transfer token to _swapRecipient
            console.log("Breakpoint6");
            IERC20(_tokenOut).safeTransfer(_swapRecipient, amountOut);
        }
    }
}
