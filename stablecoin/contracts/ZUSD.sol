// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@zrclib/tools/contracts/ShieldedPool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZUSD is ShieldedPool, ERC20 {

    address public immutable borrowerOperationsAddress;

    constructor(
        address _hasherAddress,
        address _borrowerOperationAddress
    ) ShieldedPool(5, _hasherAddress) ERC20("ZUSD", "ZUSD") {
        borrowerOperationsAddress = _borrowerOperationAddress;
    }

    function mint(address _account, uint256 _amount) external {
        _requireCallerIsBorrowerOperations();
        _mint(_account, _amount);
    }

    /**
     * @notice Interface for ZUSD to and from the shielded pool
     * If deposit, subsequent transfer will be private in the shielded pool
     * If withdraw, subsequent transfer will be normal ERC20 token transfer
     */
    function transact(Proof calldata _proof) public {
        // Deposit functionality
        if (_proof.extData.extAmount > 0) {
            transferFrom(
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

            transferFrom(
                address(this),
                _proof.extData.recipient,
                uint256(-_proof.extData.extAmount)
            );
        }
    }

    /**
     * @notice Private transfer within the shielded pool
     */
    function transfer(Proof calldata _proof) public {
        // Proof enabling transfer within the shielded pool
        _transact(_proof);
    }

    function _requireCallerIsBorrowerOperations() internal view {
        require(msg.sender == borrowerOperationsAddress, "LUSDToken: Caller is not BorrowerOperations");
    }
}
