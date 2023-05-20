// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {BlocklistVerifier} from "./generated/BlocklistVerifier.sol";

contract MerkleTreeForBlocklist {

    /// @dev all leaves are initialized as poseidon(0), which means allowed leaves
    /// @dev leaves that are subsequently blocked are set to poseidon(1)

    uint32 public immutable levels;
    bytes32 root; // root of the sparse Merkle Tree
    mapping(uint256 => bool) public blockIndices;

    struct ProofArguments {
        bytes proof;
        bytes32 oldRoot;
        bytes32 newRoot;
    }

    BlocklistVerifier public verifier;

    event newBlockDeposit(uint256 index);

    constructor(uint32 _levels, address _verifier) {
        require(_levels > 0, "_levels should be greater than zero");
        require(_levels < 32, "_levels should be less than 32");
        levels = _levels;
        // initialize sparse Merkle Tree where all leaves are poseidon(0)
        root = 0x2fa27c5cf0185654d6dcf10df1b382324abdf62d73d395be1cc935ab470354f0; // assuming tree is of level 5 TODO: remove hardcoding
        verifier = BlocklistVerifier(_verifier);
    }

    function parseProof(
        bytes memory data
    ) public pure returns (uint[2] memory a, uint[2][2] memory b, uint[2] memory c) {
        (a[0], a[1], b[0][0], b[0][1], b[1][0], b[1][1], c[0], c[1]) = abi
            .decode(data, (uint, uint, uint, uint, uint, uint, uint, uint));
    }

    function verifyGroth16Proof(
        bytes memory _proof,
        uint[2] memory _pubSignals
    ) internal view returns (bool) {
        (uint[2] memory a, uint[2][2] memory b, uint[2] memory c) = parseProof(
            _proof
        );
        return verifier.verifyProof(a, b, c, _pubSignals);
    }

    function blockDeposit(ProofArguments calldata proof, uint256 index) public {
        // TODO: set modifier to allow only governance can block a deposit
        // verify zero knowledge proof that shows that root is updated correctly
        uint[2] memory pubSignals = [
            uint(proof.oldRoot),
            uint(proof.newRoot)
        ];
        verifyGroth16Proof(proof.proof, pubSignals);

        // update root and indices
        root = proof.newRoot;
        blockIndices[index] = true;
        emit newBlockDeposit(index);
    } 
}