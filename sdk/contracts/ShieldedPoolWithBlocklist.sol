// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {CompliantVerifier} from "./generated/CompliantVerifier.sol";
import {AbstractShieldedPool} from "./AbstractShieldedPool.sol";
import {MerkleTreeWithHistory} from "./MerkleTreeWithHistory.sol";
import {MerkleTreeForBlocklist} from "./MerkleTreeForBlocklist.sol";
import {SwapExecutor} from "./SwapExecutor.sol";

contract ShieldedPoolWithBlocklist is AbstractShieldedPool {

    MerkleTreeForBlocklist public blocklistTree;
    CompliantVerifier public verifier;

    constructor(
        uint32 _levels,
        address _hasher,
        address _transactionVerifier,
        address _blocklistVerifier,
        address _swapExecutor
    ) MerkleTreeWithHistory(_levels, _hasher) {
        verifier = CompliantVerifier(_transactionVerifier);
        swapExecutor = SwapExecutor(_swapExecutor);
        blocklistTree = new MerkleTreeForBlocklist(_levels, _blocklistVerifier);
        _initialize(); // initialize the merkle tree
    }

    function verifyGroth16Proof(
        Proof memory _proof
    ) internal override view returns (bool) {
        uint[9] memory pubSignals = [
            uint(_proof.proofArguments.root),
            uint(blocklistTree.root()), // blocklist root always come from the blocklist merkle tree
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
