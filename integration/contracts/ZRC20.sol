// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@zrclib/tools/contracts/ShieldedPool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZRC20 is ShieldedPool {
    ERC20 token;

    constructor(
        address _hasherAddress,
        address _token
    ) ShieldedPool(5, _hasherAddress) {
        token = ERC20(_token);
    }

    function transact(Proof calldata _proof) public {
        // Deposit functionality
        if (_proof.extData.extAmount > 0) {
            token.transferFrom(
                msg.sender,
                address(this),
                uint256(_proof.extData.extAmount)
            );
        }

        // Proof determines whether we add to or remove from pool
        _transact(_proof);

        // Withdrawal functionality
        if (_proof.extData.extAmount < 0) {
            require(
                _proof.extData.recipient != address(0),
                "Can't withdraw to zero address"
            );

            token.transferFrom(
                address(this),
                _proof.extData.recipient,
                uint256(-_proof.extData.extAmount)
            );
        }
    }
}
