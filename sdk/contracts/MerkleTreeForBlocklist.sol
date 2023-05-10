// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MerkleTreeForBlocklist {

    constructor() {
        // TODO: initialize sparse Merkle Tree where all leaves are poseidon("allowed")
    }

    function blockDeposit(bytes32 proof, uint256 index) public {
        // TODO: set modifier to allow only governance can block a deposit
        // TODO: generate a zero knowledge proof that shows that root is updated correctly
    } 
}