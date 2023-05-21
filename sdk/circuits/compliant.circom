pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./merkle.circom";
include "./keypair.circom";

// the circuit checks that with the given indices of the withdraw leaves, the leaves are poseidon(0), which means allowed leaves
template CheckBlocklist(levels, nIns) {
    signal input inPathIndices[nIns];
    signal input inPathElements[nIns][levels];
    signal input root;

    component checkPath[nIns];
    for (var i = 0; i < nIns; i++) {
        checkPath[i] = MerkleProof(levels);
        checkPath[i].leaf <== 19014214495641488759237505126948346942972912379615652741039992445865937985820; // poseidon(0)
        checkPath[i].pathIndices <== inPathIndices[i];
        checkPath[i].pathElements <== inPathElements[i];
        root === checkPath[i].root;
    }
}

/*
Utxo structure:
{
    amount,
    pubkey,
    blinding, // random number
    asset
}
commitment = hash(amount, pubKey, blinding, asset)
nullifier = hash(commitment, merklePath, sign(privKey, commitment, merklePath))
*/

// Universal JoinSplit transaction with nIns inputs and 2 outputs
template CompliantTransaction(levels, nIns, nOuts, zeroLeaf) {
    signal input root;
    signal input blocklistRoot;
    // extAmount = external amount used for deposits and withdrawals
    // correct extAmount range is enforced on the smart contract
    // publicAmount = extAmount - fee
    signal input publicAmount;
    signal input publicAsset;
    signal input extDataHash;

    // data for transaction inputs
    signal input asset;
    signal input inputNullifier[nIns];
    signal input inAmount[nIns];
    signal input inPrivateKey[nIns];
    signal input inBlinding[nIns];
    signal input inPathIndices[nIns];
    signal input inPathElements[nIns][levels];
    signal input blocklistElements[nIns][levels];

    // data for transaction outputs
    signal input outputCommitment[nOuts];
    signal input outAmount[nOuts];
    signal input outPubkey[nOuts];
    signal input outBlinding[nOuts];

    component inKeypair[nIns];
    component inSignature[nIns];
    component inCommitmentHasher[nIns];
    component inNullifierHasher[nIns];
    component inTree[nIns];
    component inCheckRoot[nIns];
    component inCheckAsset;
    var sumIns = 0;

    // check publicAsset vs asset only if publicAsset is not default value (i.e. deposit or withdrawal)
    inCheckAsset = ForceEqualIfEnabled();
    inCheckAsset.in[0] <== asset;
    inCheckAsset.in[1] <== publicAsset;
    inCheckAsset.enabled <-- (publicAsset == 0) ? 0 : 1;

    // check that inputs are not in blocklist
    component checkInputs = CheckBlocklist(levels, nIns);
    checkInputs.inPathIndices <== inPathIndices;
    checkInputs.inPathElements <== blocklistElements;
    checkInputs.root <== blocklistRoot;

    // verify correctness of transaction inputs
    for (var tx = 0; tx < nIns; tx++) {
        inKeypair[tx] = Keypair();
        inKeypair[tx].privateKey <== inPrivateKey[tx];

        inCommitmentHasher[tx] = Poseidon(4);
        inCommitmentHasher[tx].inputs[0] <== inAmount[tx];
        inCommitmentHasher[tx].inputs[1] <== inKeypair[tx].publicKey;
        inCommitmentHasher[tx].inputs[2] <== inBlinding[tx];
        inCommitmentHasher[tx].inputs[3] <== asset;

        inSignature[tx] = Signature();
        inSignature[tx].privateKey <== inPrivateKey[tx];
        inSignature[tx].commitment <== inCommitmentHasher[tx].out;
        inSignature[tx].merklePath <== inPathIndices[tx];

        inNullifierHasher[tx] = Poseidon(3);
        inNullifierHasher[tx].inputs[0] <== inCommitmentHasher[tx].out;
        inNullifierHasher[tx].inputs[1] <== inPathIndices[tx];
        inNullifierHasher[tx].inputs[2] <== inSignature[tx].out;
        inNullifierHasher[tx].out === inputNullifier[tx];

        inTree[tx] = MerkleProof(levels);
        inTree[tx].leaf <== inCommitmentHasher[tx].out;
        inTree[tx].pathIndices <== inPathIndices[tx];
        for (var i = 0; i < levels; i++) {
            inTree[tx].pathElements[i] <== inPathElements[tx][i];
        }

        // check merkle proof only if amount is non-zero
        inCheckRoot[tx] = ForceEqualIfEnabled();
        inCheckRoot[tx].in[0] <== root;
        inCheckRoot[tx].in[1] <== inTree[tx].root;
        inCheckRoot[tx].enabled <== inAmount[tx];

        // We don't need to range check input amounts, since all inputs are valid UTXOs that
        // were already checked as outputs in the previous transaction (or zero amount UTXOs that don't
        // need to be checked either).

        sumIns += inAmount[tx];
    }

    component outCommitmentHasher[nOuts];
    component outAmountCheck[nOuts];
    var sumOuts = 0;

    // verify correctness of transaction outputs
    for (var tx = 0; tx < nOuts; tx++) {
        outCommitmentHasher[tx] = Poseidon(4);
        outCommitmentHasher[tx].inputs[0] <== outAmount[tx];
        outCommitmentHasher[tx].inputs[1] <== outPubkey[tx];
        outCommitmentHasher[tx].inputs[2] <== outBlinding[tx];
        outCommitmentHasher[tx].inputs[3] <== asset;
        outCommitmentHasher[tx].out === outputCommitment[tx];

        // Check that amount fits into 248 bits to prevent overflow
        outAmountCheck[tx] = Num2Bits(248);
        outAmountCheck[tx].in <== outAmount[tx];

        sumOuts += outAmount[tx];
    }

    // check that there are no same nullifiers among all inputs
    component sameNullifiers[nIns * (nIns - 1) / 2];
    var index = 0;
    for (var i = 0; i < nIns - 1; i++) {
      for (var j = i + 1; j < nIns; j++) {
          sameNullifiers[index] = IsEqual();
          sameNullifiers[index].in[0] <== inputNullifier[i];
          sameNullifiers[index].in[1] <== inputNullifier[j];
          sameNullifiers[index].out === 0;
          index++;
      }
    }

    // verify amount invariant
    sumIns + publicAmount === sumOuts;

    // optional safety constraint to make sure extDataHash cannot be changed
    signal extDataSquare <== extDataHash * extDataHash;
}

component main { public [root, blocklistRoot, publicAmount, publicAsset, extDataHash, inputNullifier, outputCommitment] } = CompliantTransaction(5, 2, 2, 11850551329423159860688778991827824730037759162201783566284850822760196767874);