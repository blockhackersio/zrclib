// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ShieldedPool} from "@zrclib/sdk/contracts/ShieldedPool.sol";
import {DefiantDeposit} from "./DefiantDeposit.sol";

import "hardhat/console.sol";

// Shielded ERC20 example using zrclib's shielded pool
// Supports shielding, unshielding and private transfers
contract DefiantPool is ShieldedPool {
    // Set the following based on the create2 deploy address of the PROXY that points to the implementation
    uint256 constant DEPOSIT_PROXY_CODEHASH =
        4901047390103679856002030615221728197772785794215313247401608024747471143589;
    uint256 constant WITHDRAW_PROXY_CODEHASH =
        4901047390103679856002030615221728197772785794215313247401608024747471143589;

    bool constant SKIP_CODEHASH = true;
    uint16 constant MAX_WITHDRAW_ACCOUNTS = 100;

    uint256 w_cursor;
    uint256 d_cursor;

    struct Balance {
        address account;
        uint256 amount;
    }

    mapping(uint256 => Balance) public deposits;

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

    function getWithdrawalAmounts(
        uint256 _amount
    ) internal view returns (Balance[] memory, uint16) {
        uint256 _remaining = _amount;
        uint256 _start = w_cursor;
        uint256 _end = d_cursor;
        uint16 _index = 0;
        // This might be dodgy I kind of need a dynamic array ... can possibly encode to bytes using bitshifting but I can't be othered rn
        Balance[] memory _balances = new Balance[](MAX_WITHDRAW_ACCOUNTS);
        // Iterate over the accounts until we have paid the full amount or run out of accounts
        while (_remaining > 0 && (_start + _index) < _end) {
            require(_index < MAX_WITHDRAW_ACCOUNTS);
            // Copy storage to memory
            Balance memory balance = deposits[_index + _start];

            // If the current account has enough balance to pay the full
            // amount, deduct it and exit the loop
            if (balance.amount >= _remaining) {
                balance.amount = _remaining;
                _remaining = 0;
            }
            // Otherwise, deduct the balance from the amount and move
            // to the next account
            else {
                _remaining -= balance.amount;
                _index++;
            }

            _balances[_index] = balance;
        }
        require(_remaining == 0, "Insufficient balance in pool");
        return (_balances, _index + 1);
    }

    function deposit(Proof calldata _proof) external onlyDepositProxy {
        address _proxy = msg.sender;
        require(_proof.extData.extAmount > 0, "ext amount must be positive");

        // save deposit contract to list
        deposits[d_cursor++] = Balance({
            account: _proxy,
            amount: uint256(_proof.extData.extAmount)
        });

        _transact(_proof);
    }

    function withdraw(Proof calldata _proof) external onlyWithdrawProxy {
        console.log("pool.withdraw()");
        require(_proof.extData.extAmount < 0, "extAmount must be negative");

        _transact(_proof);

        uint256 _amount = uint256(-_proof.extData.extAmount);

        console.log("getWithdrawalAmounts");
        (Balance[] memory _toPay, uint16 _length) = getWithdrawalAmounts(
            _amount
        );

        console.log("Withdrawing loop", _length);
        for (uint256 i = 0; i < _length; i++) {
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
