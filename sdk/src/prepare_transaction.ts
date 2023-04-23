import { BigNumber } from "ethers";
import { Keypair } from "./keypair";
import { Utxo } from "./utxo";
import { getProof } from "./get_proof";
import { MerkleTree } from "fixed-merkle-tree";
import { FormattedProof } from "./types";

export const MERKLE_TREE_HEIGHT = 5;

export async function prepareTransaction({
  asset = BigNumber.from(0),
  inputs = [],
  outputs = [],
  recipient = 0,
  tree,
}: {
  asset? : BigNumber;
  inputs?: Utxo[];
  outputs?: Utxo[];
  recipient?: string | 0;
  tree: MerkleTree;
}): Promise<FormattedProof> {
  while (inputs.length < 2) {
    const keypair = await Keypair.generate();
    inputs.push(new Utxo({ asset, keypair: keypair }));
  }
  while (outputs.length < 2) {
    const keypair = await Keypair.generate();
    outputs.push(new Utxo({ asset, keypair: keypair }));
  }

  let extAmount = BigNumber.from(0)
    .add(outputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)))
    .sub(inputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)));

  const zrcProof = await getProof({
    asset,
    inputs,
    outputs,
    tree,
    extAmount,
    recipient,
  });

  return zrcProof;
}
