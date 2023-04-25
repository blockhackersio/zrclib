// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ShieldedPool} from "@zrclib/sdk/contracts/ShieldedPool.sol";
import {DefiantDeposit} from "./DefiantDeposit.sol";
import {WithdrawalAmountManagerImpl} from "./WithdrawalAmountManagerImpl.sol";
import "hardhat/console.sol";

// Shielded ERC20 example using zrclib's shielded pool
// Supports shielding, unshielding and private transfers
contract DefiantPool is ShieldedPool, WithdrawalAmountManagerImpl {
    // Set the following based on the create2 deploy address of the PROXY that points to the implementation
    uint256 constant DEPOSIT_PROXY_CODEHASH =
        4901047390103679856002030615221728197772785794215313247401608024747471143589;
    uint256 constant WITHDRAW_PROXY_CODEHASH =
        4901047390103679856002030615221728197772785794215313247401608024747471143589;

    bool constant SKIP_CODEHASH = true;

    modifier onlyDepositProxy() {
        address _proxy = msg.sender;

        /// This will not be correct until we deployso commenting out for now
        if (!SKIP_CODEHASH) {
            require(
                DEPOSIT_PROXY_CODEHASH == uint256(_proxy.codehash),
                "Cannot call this method from the given contract"
            );
        }
        ///
        _;
    }

    modifier onlyWithdrawProxy() {
        address _proxy = msg.sender;

        /// This will not be correct until we deployso commenting out for now
        if (!SKIP_CODEHASH) {
            require(
                WITHDRAW_PROXY_CODEHASH == uint256(_proxy.codehash),
                "Cannot call this method from the given contract"
            );
        }
        ///
        _;
    }

    constructor(
        address _hasherAddress,
        address _verifier,
        address _swapExecutor
    ) ShieldedPool(5, _hasherAddress, _verifier, _swapExecutor) {}

    function deposit(Proof calldata _proof) external onlyDepositProxy {
        address _proxy = msg.sender;
        require(_proof.extData.extAmount > 0, "ext amount must be positive");

        _addDeposit(_proxy, uint256(_proof.extData.extAmount));

        _transact(_proof);
    }

    function withdraw(Proof calldata _proof) external onlyWithdrawProxy {
        console.log("pool.withdraw()");
        require(_proof.extData.extAmount < 0, "extAmount must be negative");

        _transact(_proof);

        uint256 _amount = uint256(-_proof.extData.extAmount);

        console.log("getWithdrawalAmounts");
        (Balance[] memory _toPay, uint16 _length) = _getWithdrawalAmounts(
            _amount
        );

        _consumeDeposit(_length);

        console.log("Withdrawing loop", _length);
        for (uint256 i = 0; i < _length - 1; i++) {
            DefiantDeposit(_toPay[i].account).transfer(
                _proof.extData.recipient,
                _toPay[i].amount
            );
        }
    }

    function transact(Proof calldata _proof) public override {
        require(_proof.extData.extAmount == 0, "extAmount must be 0");

        _transact(_proof);
    }
}
