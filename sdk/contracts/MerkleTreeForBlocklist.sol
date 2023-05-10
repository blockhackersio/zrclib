// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MerkleTreeForBlocklist {

    /// @dev all leaves are initialized as poseidon(0), which means allowed leaves
    /// @dev leaves that are subsequently blocked are set to poseidon(1)

    uint32 public immutable levels;
    bytes32 root; // root of the sparse Merkle Tree
    mapping(uint256 => bool) blockIndices;

    event newBlockDeposit(uint256 index);

    constructor(uint32 _levels) {
        require(_levels > 0, "_levels should be greater than zero");
        require(_levels < 32, "_levels should be less than 32");
        levels = _levels;
        // initialize sparse Merkle Tree where all leaves are poseidon(0)
        root = 0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55;
    }

    function blockDeposit(bytes32 newRoot, uint256 index) public {
        // TODO: set modifier to allow only governance can block a deposit
        // TODO: generate a zero knowledge proof that shows that root is updated correctly
        root = newRoot;
        blockIndices[index] = true;
        emit newBlockDeposit(index);
    } 
}