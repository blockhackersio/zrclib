// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {TransactionVerifier} from "./generated/TransactionVerifier.sol";
import {AbstractShieldedPool} from "./AbstractShieldedPool.sol";
import {MerkleTreeWithHistory} from "./MerkleTreeWithHistory.sol";
import {SwapExecutor} from "./SwapExecutor.sol";

contract ShieldedPool is AbstractShieldedPool {
    TransactionVerifier public verifier;

    constructor(
        uint32 _levels,
        address _hasher,
        address _verifier,
        address _swapExecutor
    ) MerkleTreeWithHistory(_levels, _hasher) {
        verifier = TransactionVerifier(_verifier);
        swapExecutor = SwapExecutor(_swapExecutor);
        _initialize(); // initialize the merkle tree
    }

    function verifyGroth16Proof(
        Proof memory _proof
    ) internal override view returns (bool) {
        uint[8] memory pubSignals = [
            uint(_proof.proofArguments.root),
            _proof.proofArguments.publicAmount,
            uint160(_proof.proofArguments.publicAsset),
            uint(_proof.proofArguments.extDataHash),
            uint(_proof.proofArguments.inputNullifiers[0]),
            uint(_proof.proofArguments.inputNullifiers[1]),
            uint(_proof.proofArguments.outputCommitments[0]),
            uint(_proof.proofArguments.outputCommitments[1])
        ];
        (uint[2] memory a, uint[2][2] memory b, uint[2] memory c) = parseProof(
            _proof.proofArguments.proof
        );
        return verifier.verifyProof(a, b, c, pubSignals);
    }
}
