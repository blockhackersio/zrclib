// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {MultiTransactionVerifier} from "./generated/MultitransactionVerifier.sol";
import {MerkleTreeWithHistory} from "./MerkleTreeWithHistory.sol";

contract ShieldedPool is MerkleTreeWithHistory {
    int256 public MAX_EXT_AMOUNT = 2 ** 248;

    mapping(bytes32 => bool) public nullifierHashes;

    MultiTransactionVerifier public verifier;

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
        bytes32 root;
        bytes32[2] inputNullifiers;
        bytes32[2] outputCommitments;
        uint256 publicAmount;
        uint256 publicAsset;
        bytes32 extDataHash;
    }

    event NewCommitment(
        bytes32 indexed commitment,
        uint256 indexed index,
        bytes encryptedOutput
    );

    event NewNullifier(bytes32 indexed nullifier);

    constructor(
        uint32 _levels,
        address _hasher,
        address _verifier
    ) MerkleTreeWithHistory(_levels, _hasher) {
        verifier = MultiTransactionVerifier(_verifier);
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

        uint[] memory pubSignals = new uint[](7);
        pubSignals[0] = uint(_proof.proofArguments.root);
        pubSignals[1] = _proof.proofArguments.publicAmount;
        pubSignals[2] = _proof.proofArguments.publicAsset;
        pubSignals[2] = uint(_proof.proofArguments.extDataHash);
        pubSignals[3] = uint(_proof.proofArguments.inputNullifiers[0]);
        pubSignals[4] = uint(_proof.proofArguments.inputNullifiers[1]);
        pubSignals[5] = uint(_proof.proofArguments.outputCommitments[0]);
        pubSignals[6] = uint(_proof.proofArguments.outputCommitments[1]);
        require(
            verifier.verifyProof(
                _proof.proofArguments.proof,
                pubSignals
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
