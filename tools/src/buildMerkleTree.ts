import { Contract } from "ethers";
import { MerkleTree } from "fixed-merkle-tree";
import { poseidonHash2 } from "./poseidon";
import { toFixedHex } from "./utils";
import { MERKLE_TREE_HEIGHT } from "./prepare_transaction";

export async function buildMerkleTree(contract: Contract) {
  const filter = contract.filters.NewCommitment();
  const events = await contract.queryFilter(filter, 0);

  const leaves = events
    .sort((a, b) => a.args?.index - b.args?.index)
    .map((e) => toFixedHex(e.args?.commitment));

  console.log(leaves);

  const t = new MerkleTree(MERKLE_TREE_HEIGHT, leaves, {
    hashFunction: poseidonHash2,
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  });

  return t;
}
