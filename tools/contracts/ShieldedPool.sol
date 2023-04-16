// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {TransactionVerifier} from "./generated/TransactionVerifier.sol";
import {MerkleTreeWithHistory} from "./MerkleTreeWithHistory.sol";

contract ShieldedPool is TransactionVerifier, MerkleTreeWithHistory {
    int256 public MAX_EXT_AMOUNT = 2 ** 248;

    mapping(bytes32 => bool) public nullifierHashes;

    struct Proof {
        ProofArguments proofArguments;
        ExtData extData;
    }

    struct ExtData {
        address recipient;
        int256 extAmount;
        bytes encryptedOutput1;
        bytes encryptedOutput2;
    }

    struct ProofArguments {
        bytes proof;
        uint[] pubSignals;
        bytes32 root;
        bytes32[] inputNullifiers;
        bytes32[2] outputCommitments;
        uint256 publicAmount;
        bytes32 extDataHash;
    }

    event NewCommitment(
        bytes32 indexed commitment,
        uint256 indexed index,
        bytes indexed encryptedOutput
    );

    event NewNullifier(bytes32 indexed nullifier);

    constructor(
        uint32 _levels,
        address _hasher
    ) MerkleTreeWithHistory(_levels, _hasher) {
        _initialize(); // initialize the merkle tree
    }

    function _transact(Proof calldata _proof) internal {
        require(isKnownRoot(_proof.proofArguments.root), "Invalid merkle root");
        for (
            uint256 i = 0;
            i < _proof.proofArguments.inputNullifiers.length;
            i++
        ) {
            require(
                !isSpent(_proof.proofArguments.inputNullifiers[i]),
                "Input is already spent"
            );
        }
        require(
            uint256(_proof.proofArguments.extDataHash) ==
                uint256(keccak256(abi.encode(_proof.extData))) % FIELD_SIZE,
            "Incorrect external data hash"
        );
        require(
            _proof.extData.extAmount > -MAX_EXT_AMOUNT &&
                _proof.extData.extAmount < MAX_EXT_AMOUNT,
            "Invalid public amount"
        );

        require(
            verifyProof(
                _proof.proofArguments.proof,
                _proof.proofArguments.pubSignals
            ),
            "Invalid proof"
        );

        for (
            uint256 i = 0;
            i < _proof.proofArguments.inputNullifiers.length;
            i++
        ) {
            nullifierHashes[_proof.proofArguments.inputNullifiers[i]] = true;
        }

        if (_proof.extData.extAmount < 0) {
            require(
                _proof.extData.recipient != address(0),
                "Can't withdraw to zero address"
            );
        }

        _insert(
            _proof.proofArguments.outputCommitments[0],
            _proof.proofArguments.outputCommitments[1]
        );

        emit NewCommitment(
            _proof.proofArguments.outputCommitments[0],
            nextIndex - 2,
            _proof.extData.encryptedOutput1
        );

        emit NewCommitment(
            _proof.proofArguments.outputCommitments[1],
            nextIndex - 1,
            _proof.extData.encryptedOutput2
        );

        for (
            uint256 i = 0;
            i < _proof.proofArguments.inputNullifiers.length;
            i++
        ) {
            emit NewNullifier(_proof.proofArguments.inputNullifiers[i]);
        }
    }

    /** @dev whether a note is already spent */
    function isSpent(bytes32 _nullifierHash) public view returns (bool) {
        return nullifierHashes[_nullifierHash];
    }
}
