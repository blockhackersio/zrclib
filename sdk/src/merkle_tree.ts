import { Contract } from "ethers";
import { MerkleTree } from "fixed-merkle-tree";
import { poseidonHash, poseidonHash2, fieldToString } from "./poseidon";
import { toFixedHex } from "./utils";
import { MERKLE_TREE_HEIGHT } from "./prepare_transaction";

export async function buildMerkleTree(contract: Contract) {
  const filter = contract.filters.NewCommitment();
  const events = await contract.queryFilter(filter, 0);

  const leaves = events
    .sort((a, b) => a.args?.index - b.args?.index)
    .map((e) => toFixedHex(e.args?.commitment));

  const t = new MerkleTree(MERKLE_TREE_HEIGHT, leaves, {
    hashFunction: poseidonHash2,
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  });

  return t;
}

export async function buildBlocklistMerkleTree(contract: Contract) {
  // poseidon(0) as allowed leaf
  // poseidon(1) as blocked leaf

  const filter = contract.filters.NewBlockDeposit();
  const events = await contract.queryFilter(filter, 0);

  // create a sparse merkle tree, where all leaves are poseidon(0)
  let tree = new MerkleTree(MERKLE_TREE_HEIGHT, Array(2**MERKLE_TREE_HEIGHT).fill(fieldToString(poseidonHash([0]))), {
    hashFunction: poseidonHash2,
    zeroElement:
      fieldToString(poseidonHash([0])),
  });

  // update blocked leaves of merkle tree
  for (const event of events) {
    const index = event.args?.index;
    tree.update(index, fieldToString(poseidonHash([1])));
  }

  return tree;
}