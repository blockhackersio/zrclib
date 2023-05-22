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

    function transact(Proof calldata _proof) public override {
        require(
            _proof.extData.recipient != address(swapExecutor),
            "recipient should not be swapExecutor"
        ); // relayer must use transactAndSwap instead
        
        // Deposit functionality
        if (_proof.extData.extAmount > 0) {
            IERC20 token = IERC20(_proof.proofArguments.publicAsset);
            token.transferFrom(
                msg.sender,
                address(this),
                uint256(_proof.extData.extAmount)
            );
        }

        // Proof determines whether we add to or remove from pool
        super.transact(_proof);

        // Withdrawal functionality
        if (_proof.extData.extAmount < 0) {
            require(
                _proof.extData.recipient != address(0),
                "Can't withdraw to zero address"
            );

            IERC20 token = IERC20(_proof.proofArguments.publicAsset);
            token.transfer(
                _proof.extData.recipient,
                uint256(-_proof.extData.extAmount)
            );
        }
    }

    function transactAndSwap(Proof calldata _proof) public override {
        // Withdrawal functionality (transfer to swap executor)
        if (_proof.extData.extAmount < 0) {
            require(
                _proof.extData.recipient != address(0),
                "Can't withdraw to zero address"
            );

            IERC20 token = IERC20(_proof.proofArguments.publicAsset);
            token.transfer(
                _proof.extData.recipient,
                uint256(-_proof.extData.extAmount)
            );
        }
        super.transactAndSwap(_proof);
    }
}