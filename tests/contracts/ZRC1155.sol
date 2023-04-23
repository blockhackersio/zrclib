// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ShieldedPool} from "@zrclib/sdk/contracts/ShieldedPool.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Shielded ERC1155 example using zrclib's shielded pool
// Supports shielding, unshielding and private transfers
contract ZRC1155 is ERC1155, ShieldedPool, Ownable {
    constructor(
        address _hasherAddress,
        address _verifier
    ) ShieldedPool(5, _hasherAddress, _verifier) ERC1155("") {}

    function mint(address _address, uint256 _tokenId, uint256 _amount) public onlyOwner {
        _mint(_address, _tokenId, _amount, "");
    }

    function transact(Proof calldata _proof) public {
        // Deposit functionality
        if (_proof.extData.extAmount > 0) {
            _safeTransferFrom(
                _proof.extData.recipient,
                address(this),
                _proof.proofArguments.publicAsset, 
                uint256(_proof.extData.extAmount),
                ""
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

            _safeTransferFrom(
                address(this),
                _proof.extData.recipient,
                _proof.proofArguments.publicAsset, 
                uint256(_proof.extData.extAmount),
                ""
            );
        }
    }
}
