import { BigNumber } from "ethers";
import { BaseUtxo } from "./types";
import { getExtDataHash, shuffle, stringifyBigInts, toFixedHex } from "./utils";
import { FIELD_SIZE, numbers } from "./constants";
import { fieldToObject } from "./poseidon";
import { plonk } from "snarkjs";
import MerkleTree from "fixed-merkle-tree";

export type ProofParams = {
  inputs: BaseUtxo[];
  outputs: BaseUtxo[];
  tree: MerkleTree;
  // isL1Withdrawal: boolean;
  // l1Fee: BigNumber;
  extAmount: BigNumber;
  // fee: BigNumber;
  recipient: string | 0;
  // relayer: string | BigNumber;
};

async function generateProof(inputs: object) {
  const { proof } = await plonk.fullProve(
    inputs,
    `../tools/compiled/transaction_js/transaction.wasm`,
    `../tools/compiled/transaction.zkey`
  );

  const calldata = await plonk.exportSolidityCallData(proof, []);
  const [proofString] = calldata.split(",");

  return proofString as string;
}

export async function getProof({
  inputs,
  outputs,
  tree,
  extAmount,
  recipient,
}: ProofParams) {
  inputs = shuffle(inputs);
  outputs = shuffle(outputs);

  const inputMerklePathIndices = [];
  const inputMerklePathElements = [];

  for (const input of inputs) {
    if (input.amount.gt(numbers.ZERO)) {
      input.index = tree.indexOf(toFixedHex(input.getCommitment()));

      if (input.index < numbers.ZERO) {
        throw new Error(
          `Input commitment ${toFixedHex(input.getCommitment())} was not found`
        );
      }
      inputMerklePathIndices.push(input.index);
      inputMerklePathElements.push(tree.path(input.index).pathElements);
    } else {
      inputMerklePathIndices.push(numbers.ZERO);
      inputMerklePathElements.push(
        new Array(numbers.MERKLE_TREE_HEIGHT).fill(numbers.ZERO)
      );
    }
  }

  const extData = {
    recipient: toFixedHex(recipient, 20),
    extAmount: toFixedHex(extAmount),
    encryptedOutput1: outputs[0].encrypt(),
    encryptedOutput2: outputs[1].encrypt(),
  };

  const inputNullifier: bigint[] = [];
  const extDataHash = getExtDataHash(extData);
  for (const input of inputs) {
    const nullifier = input.getNullifier();
    inputNullifier.push(fieldToObject(nullifier));
  }
  const outputCommitment: bigint[] = [];
  for (const output of outputs) {
    const commitment = output.getCommitment();
    outputCommitment.push(fieldToObject(commitment));
  }

  let input = {
    root: fieldToObject(
      (tree as any)._layers[tree.levels][0] ?? (tree as any)._zeros[tree.levels]
    ),
    inputNullifier: inputNullifier,
    outputCommitment: outputCommitment,
    publicAmount: BigNumber.from(extAmount)
      // .sub(fee)
      .add(FIELD_SIZE)
      .mod(FIELD_SIZE)
      .toString(),
    extDataHash: BigInt(extDataHash),

    // data for 2 transaction inputs
    inAmount: inputs.map((x) => BigInt(x.amount.toString())),
    inPrivateKey: inputs.map((x) => BigInt(x.keypair.privkey)),
    inBlinding: inputs.map((x) => BigInt(x.blinding.toString())),
    inPathIndices: inputMerklePathIndices,
    inPathElements: inputMerklePathElements,

    // data for 2 transaction outputs
    outAmount: outputs.map((x) => BigInt(x.amount.toString())),
    outBlinding: outputs.map((x) => BigInt(x.blinding.toString())),
    outPubkey: outputs.map((x) => fieldToObject(x.keypair.pubkey)),
  };

  const proof = await generateProof(stringifyBigInts(input));

  const args = {
    proof,
    root: input.root,
    inputNullifiers: inputNullifier,
    outputCommitments: outputCommitment,
    publicAmount: input.publicAmount,
    extDataHash: extDataHash,
  };

  return {
    extData,
    proof,
    args,
  };
}
