pragma circom 2.1.4;

include "./merkle.circom";

// all leaves in the blocklist merkle tree is poseidon("allowed")
// except for blocked leaves, which are poseidon("blocked")
// the circuit checks that with the given indices of the withdraw leaves, the leaves are poseidon("allowed")
template Blocklist(levels, nIns) {
    signal input leaf;
    signal input inPathIndices[nIns];
    signal input inPathElements[nIns][levels];
    signal input root;

    component checkPath[nIns];
    for (var i = 0; i < nIns; i++) {
        checkPath[i] = MerkleProof(levels);
        checkPath[i].leaf <== leaf;
        checkPath[i].pathIndices <== inPathIndices[i];
        checkPath[i].pathElements <== inPathElements[i];
        root === checkPath[i].root;
    }
}

component main { public [leaf, root] } = Blocklist(5, 2);