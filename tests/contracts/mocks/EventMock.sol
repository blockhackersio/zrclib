// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract EventMock {
    constructor() {}

    event NewCommitment(
        bytes32 indexed commitment,
        uint256 indexed index,
        bytes encryptedOutput
    );

    event NewNullifier(bytes32 indexed nullifier);

    function newCommitment(
        bytes32 _commitment,
        uint256 _index,
        bytes calldata _encryptedOutput
    ) public {
        emit NewCommitment(_commitment, _index, _encryptedOutput);
    }

    function newNullifier(bytes32 _nullifier) public {
        emit NewNullifier(_nullifier);
    }
}
