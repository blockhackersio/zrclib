pragma circom 2.1.4;

include "./merkle.circom";

// all leaves in the blocklist merkle tree is poseidon(0)
// except for blocked leaves, which are poseidon(1)
// the circuit checks that blocklist's merkle root is updated correctly
template UpdateBlocklist(levels) {
    signal input pathIndices;
    signal input pathElements[levels];
    signal input oldRoot;
    signal input newRoot;

    component checkInitialPath = MerkleProof(levels);
    checkInitialPath.leaf <== 19014214495641488759237505126948346942972912379615652741039992445865937985820; // poseidon(0) which is allowed leaf
    checkInitialPath.pathIndices <== pathIndices;
    checkInitialPath.pathElements <== pathElements;
    oldRoot === checkInitialPath.root;

    component checkUpdatedPath = MerkleProof(levels);
    checkUpdatedPath.leaf <== 18586133768512220936620570745912940619677854269274689475585506675881198879027; // poseidon(1) which is blocked leaf
    checkUpdatedPath.pathIndices <== pathIndices;
    checkUpdatedPath.pathElements <== pathElements;
    newRoot === checkUpdatedPath.root;
}

component main { public [oldRoot, newRoot] } = UpdateBlocklist(5);