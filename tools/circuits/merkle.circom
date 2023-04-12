pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices bits is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template MerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices;
    signal output root;

    component switcher[levels];
    component hasher[levels];

    component indexBits = Num2Bits(levels);
    indexBits.in <== pathIndices;

    for (var i = 0; i < levels; i++) {
        switcher[i] = Switcher();
        switcher[i].L <== i == 0 ? leaf : hasher[i - 1].out;
        switcher[i].R <== pathElements[i];
        switcher[i].sel <== indexBits.out[i];

        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== switcher[i].outL;
        hasher[i].inputs[1] <== switcher[i].outR;
    }

    root <== hasher[levels - 1].out;
}

// Helper template that computes hashes of the next tree layer
template TreeLayer(height) {
  var nItems = 1 << height;
  signal input ins[nItems * 2];
  signal output outs[nItems];

  component hash[nItems];
  for(var i = 0; i < nItems; i++) {
    hash[i] = Poseidon(2);
    hash[i].inputs[0] <== ins[i * 2];
    hash[i].inputs[1] <== ins[i * 2 + 1];
    hash[i].out ==> outs[i];
  }
}

// Builds a merkle tree from leaf array
template MerkleTree(levels) {
  signal input leaves[1 << levels];
  signal output root;

  component layers[levels];
  for(var level = levels - 1; level >= 0; level--) {
    layers[level] = TreeLayer(level);
    for(var i = 0; i < (1 << (level + 1)); i++) {
      layers[level].ins[i] <== level == levels - 1 ? leaves[i] : layers[level + 1].outs[i];
    }
  }

  root <== levels > 0 ? layers[0].outs[0] : leaves[0];
}

// inserts a subtree into a merkle tree
// checks that tree previously contained zeroes is the same positions
// zeroSubtreeRoot is a root of a subtree that contains only zeroes
template MerkleTreeUpdater(levels, subtreeLevels, zeroSubtreeRoot) {
    var remainingLevels = levels - subtreeLevels;

    signal input oldRoot;
    signal input newRoot;
    signal input leaves[1 << subtreeLevels];
    signal input pathIndices;
    signal input pathElements[remainingLevels];

    // calculate subtree root
    component subtree = MerkleTree(subtreeLevels);
    for(var i = 0; i < (1 << subtreeLevels); i++) {
        subtree.leaves[i] <== leaves[i];
    }

    component treeBefore = MerkleProof(remainingLevels);
    for(var i = 0; i < remainingLevels; i++) {
        treeBefore.pathElements[i] <== pathElements[i];
    }
    treeBefore.pathIndices <== pathIndices;
    treeBefore.leaf <== zeroSubtreeRoot;
    treeBefore.root === oldRoot;

    component treeAfter = MerkleProof(remainingLevels);
    for(var i = 0; i < remainingLevels; i++) {
        treeAfter.pathElements[i] <== pathElements[i];
    }
    treeAfter.pathIndices <== pathIndices;
    treeAfter.leaf <== subtree.root;
    treeAfter.root === newRoot;
}