import { BigNumber } from "ethers";
import { Keypair } from "./keypair";
import { Utxo } from "./utxo";
import { ZrcProof, getProof } from "./get_proof";
import { MerkleTree } from "fixed-merkle-tree";
import { poseidonHash2 } from "./poseidon";

const MERKLE_TREE_HEIGHT = 5;

async function buildMerkleTree() {
  // TODO: get the leaves, if any
  return new MerkleTree(MERKLE_TREE_HEIGHT, [], {
    hashFunction: poseidonHash2,
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  });
}

export async function prepareTransaction({
  inputs = [],
  outputs = [],
  recipient = 0,
}: {
  inputs?: Utxo[];
  outputs?: Utxo[];
  recipient?: string | 0;
}): Promise<ZrcProof> {
  while (inputs.length < 2) {
    const keypair = new Keypair();
    inputs.push(new Utxo({ keypair: keypair }));
  }
  while (outputs.length < 2) {
    const keypair = new Keypair();
    outputs.push(new Utxo({ keypair: keypair }));
  }

  let extAmount = BigNumber.from(0)
    .add(outputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)))
    .sub(inputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)));

  const { args, extData } = await getProof({
    inputs,
    outputs,
    tree: await buildMerkleTree(),
    extAmount,
    recipient,
  });
  return {
    args,
    extData,
  };
}
