// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {TransactionVerifier} from "./generated/TransactionVerifier.sol";
import {MerkleTreeWithHistory} from "./MerkleTreeWithHistory.sol";
import {SwapExecutor} from "./SwapExecutor.sol";

contract ShieldedPool is MerkleTreeWithHistory {
    int256 public MAX_EXT_AMOUNT = 2 ** 248;

    mapping(bytes32 => bool) public nullifierHashes;

    TransactionVerifier public verifier;
    SwapExecutor public swapExecutor;

    struct Proof {
        ProofArguments proofArguments;
        ExtData extData;
    }

    struct ExtData {
        address recipient;
        int256 extAmount;
        bytes encryptedOutput1;
        bytes encryptedOutput2;
        address tokenOut; // unshield -> swap via uni or 0x -> re-shield to this token
        uint256 amountOutMin;
        address swapRecipient;
        address swapRouter;
        bytes swapData; // maybe we can move swapRouter and swapData outside extdata hash calculation, and let relayer fill them to enhance privacy
        bytes transactData; // used for re-shield
    }

    struct ProofArguments {
        bytes proof;
        bytes32 root;
        bytes32[2] inputNullifiers;
        bytes32[2] outputCommitments;
        uint256 publicAmount;
        address publicAsset;
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
        address _verifier,
        address _swapExecutor
    ) MerkleTreeWithHistory(_levels, _hasher) {
        verifier = TransactionVerifier(_verifier);
        swapExecutor = SwapExecutor(_swapExecutor);
        _initialize(); // initialize the merkle tree
    }

    function parseProof(
        bytes memory data
    )
        public
        pure
        returns (uint[2] memory a, uint[2][2] memory b, uint[2] memory c)
    {
        require(data.length == 192, "Invalid input length");

        // Define the nested arrays
        uint[2] memory memoryA;
        uint[2][2] memory memoryB;
        uint[2] memory memoryC;

        // Parse the input bytes into the nested arrays
        uint offset = 32;
        assembly {
            // Read the values for a from the input bytes
            mstore(add(memoryA, 0), mload(add(data, offset)))
            mstore(add(add(memoryA, 32), 0), mload(add(data, add(offset, 32))))
            offset := add(offset, 64)

            // Read the values for b from the input bytes
            let ptr := add(memoryB, 0)
            for {
                let i := 0
            } lt(i, 2) {
                i := add(i, 1)
            } {
                mstore(add(ptr, mul(i, 64)), mload(add(data, offset)))
                mstore(
                    add(add(ptr, mul(i, 64)), 32),
                    mload(add(data, add(offset, 32)))
                )
                offset := add(offset, 64)
            }

            // Read the values for c from the input bytes
            mstore(add(memoryC, 0), mload(add(data, offset)))
            mstore(add(add(memoryC, 32), 0), mload(add(data, add(offset, 32))))
        }

        // Return the values as a tuple
        return (memoryA, memoryB, memoryC);
    }

    function verifyGroth16Proof(
        bytes memory _proof,
        uint[8] memory _pubSignals
    ) internal view returns (bool) {
        (uint[2] memory a, uint[2][2] memory b, uint[2] memory c) = parseProof(
            _proof
        );
        return verifier.verifyProof(a, b, c, _pubSignals);
    }

    // expose a public function to allow users to submit proofs (to be overriden by child contracts)
    function transact(Proof calldata _proof) public virtual {
        require(
            _proof.extData.recipient != address(swapExecutor),
            "recipient should not be swapExecutor"
        ); // relayer must use transactAndSwap instead
        _transact(_proof);
    }

    function transactAndSwap(Proof calldata _proof) public virtual {
        require(_proof.extData.extAmount < 0, "extAmount should be negative");
        require(
            _proof.proofArguments.publicAsset != address(0),
            "publicAsset should not be 0x0"
        ); // have to withdraw something

        // actually withdraw
        _transact(_proof);

        // swap and transfer or re-shield
        require(
            _proof.extData.recipient == address(swapExecutor),
            "only swapExecutor can be recipient"
        );
        require(
            _proof.extData.tokenOut != address(0),
            "tokenOut should not be 0x0"
        );
        require(
            _proof.extData.amountOutMin > 0,
            "amountOutMin should be greater than 0"
        );

        swapExecutor.executeSwap(
            address(_proof.proofArguments.publicAsset),
            _proof.extData.tokenOut,
            uint256(-_proof.extData.extAmount),
            _proof.extData.amountOutMin,
            _proof.extData.swapRouter,
            _proof.extData.swapRecipient,
            _proof.extData.swapData,
            _proof.extData.transactData
        );
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
        require(
            verifyGroth16Proof(_proof.proofArguments.proof, pubSignals),
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
