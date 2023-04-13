// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {TransactionVerifier} from "./generated/TransactionVerifier.sol";
import {MerkleTreeWithHistory} from "./MerkleTreeWithHistory.sol";

contract ZRC20 is TransactionVerifier, MerkleTreeWithHistory {
    string private _name;
    string private _symbol;

    int256 public MAX_EXT_AMOUNT = 2**248;
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

    event NewCommitment(bytes32 commitment, uint256 index, bytes encryptedOutput);
    event NewNullifier(bytes32 nullifier);

    constructor(
        string memory name_, 
        string memory symbol_,
        uint32 _levels,
        address _hasher
    ) MerkleTreeWithHistory(_levels, _hasher) {
        _name = name_;
        _symbol = symbol_;
    }

    function _mint(
        uint256 amount,
        Proof memory proof
    ) public {
        _transact(proof.proofArguments, proof.extData);
    }

    function _transact(ProofArguments memory _args, ExtData memory _extData) internal {
        // require(isKnownRoot(_args.root), "Invalid merkle root");
        for (uint256 i = 0; i < _args.inputNullifiers.length; i++) {
            // require(!isSpent(_args.inputNullifiers[i]), "Input is already spent");
        }
        require(uint256(_args.extDataHash) == uint256(keccak256(abi.encode(_extData))) % FIELD_SIZE, "Incorrect external data hash");
        require(_extData.extAmount > -MAX_EXT_AMOUNT && _extData.extAmount < MAX_EXT_AMOUNT, "Invalid public amount");

        require(verifyProof(_args.proof, _args.pubSignals), "Invalid proof");

        for (uint256 i = 0; i < _args.inputNullifiers.length; i++) {
            nullifierHashes[_args.inputNullifiers[i]] = true;
        }

        if (_extData.extAmount < 0) {
            require(_extData.recipient != address(0), "Can't withdraw to zero address");
        }

        // _insert(_args.outputCommitments[0], _args.outputCommitments[1]);
        // emit NewCommitment(_args.outputCommitments[0], nextIndex - 2, _extData.encryptedOutput1);
        // emit NewCommitment(_args.outputCommitments[1], nextIndex - 1, _extData.encryptedOutput2);
        // for (uint256 i = 0; i < _args.inputNullifiers.length; i++) {
        //     emit NewNullifier(_args.inputNullifiers[i]);
        // }
    }

    /** @dev whether a note is already spent */
    function isSpent(bytes32 _nullifierHash) public view returns (bool) {
        return nullifierHashes[_nullifierHash];
    }
}
