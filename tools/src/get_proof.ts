import { BigNumber } from "ethers";
import { getExtDataHash, shuffle, stringifyBigInts, toFixedHex } from "./utils";
import { FIELD_SIZE } from "./constants";
import { fieldToObject } from "./poseidon";
import { plonk } from "snarkjs";
import MerkleTree from "fixed-merkle-tree";

// XXX: NODE dependency remove!!
import * as path from "path";
import { Utxo } from "./utxo";
import { Element } from "fixed-merkle-tree";
import { FormattedProof, ProofArguments } from "./types";

export type ProofParams = {
  inputs: Utxo[];
  outputs: Utxo[];
  tree: MerkleTree;
  extAmount: BigNumber;
  recipient: string | 0;
};

async function generateProof(inputs: object) {
  const { proof } = await plonk.fullProve(
    inputs,
    // XXX: need to handle this path based on implementation
    path.resolve(__dirname, `../compiled/transaction_js/transaction.wasm`),
    path.resolve(__dirname, `../compiled/transaction.zkey`)
  );
  const calldata = await plonk.exportSolidityCallData(proof, []);
  const [proofString] = calldata.split(",");

  return proofString as string;
}

type ProofArgs = {
  proof: string;
  root: bigint;
  inputNullifiers: bigint[];
  outputCommitments: bigint[];
  publicAmount: string;
  extDataHash: BigNumber;
};

type ProofExtData = {
  recipient: string;
  extAmount: string;
  encryptedOutput1: string;
  encryptedOutput2: string;
};

export type ZrcProof = {
  args: ProofArgs;
  extData: ProofExtData;
};

export async function getProof({
  inputs,
  outputs,
  tree,
  extAmount,
  recipient,
}: ProofParams): Promise<FormattedProof> {
  inputs = shuffle(inputs);
  outputs = shuffle(outputs);

  const inputMerklePathIndices: number[] = [];
  const inputMerklePathElements: Element[][] = [];

  for (const input of inputs) {
    if (input.amount.gt(0)) {
      input.index = tree.indexOf(toFixedHex(input.getCommitment()));

      if (input.index < 0) {
        throw new Error(
          `Input commitment ${toFixedHex(input.getCommitment())} was not found`
        );
      }
      inputMerklePathIndices.push(input.index);
      inputMerklePathElements.push(tree.path(input.index).pathElements);
    } else {
      inputMerklePathIndices.push(0);
      inputMerklePathElements.push(new Array(tree.levels).fill(0));
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
    const commitment = output.getCommitment()!;
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
    extDataHash: extDataHash.toBigInt(),

    // data for 2 transaction inputs
    inAmount: inputs.map((x) => x.amount.toBigInt()),
    inPrivateKey: inputs.map((x) => BigInt(x.keypair.privkey)),
    inBlinding: inputs.map((x) => BigInt(x.blinding.toString())),
    inPathIndices: inputMerklePathIndices,
    inPathElements: inputMerklePathElements,

    // data for 2 transaction outputs
    outAmount: outputs.map((x) => BigInt(x.amount.toString())),
    outBlinding: outputs.map((x) => BigInt(x.blinding.toString())),
    outPubkey: outputs.map((x) => fieldToObject(x.keypair!.pubkey)),
  };
  const istring = stringifyBigInts(input);
  const proof = await generateProof(istring);

  const args: ZrcProof["args"] = {
    proof,
    root: input.root,
    inputNullifiers: inputNullifier,
    outputCommitments: outputCommitment,
    publicAmount: input.publicAmount,
    extDataHash: extDataHash,
  };

  return formatArguments({
    extData,
    args,
  });
}

async function formatArguments(zrcProof: ZrcProof): Promise<FormattedProof> {
  const args = zrcProof.args;
  const extData = zrcProof.extData;
  const {
    proof,
    root,
    publicAmount,
    extDataHash,
    inputNullifiers,
    outputCommitments,
  } = args;

  // prepare proof arguments to the correct format
  let pubSignals: string[] = [
    root.toString(),
    publicAmount,
    extDataHash.toString(),
    ...inputNullifiers.map((e) => e.toString()),
    ...outputCommitments.map((e) => e.toString()),
  ];

  const proofArguments: ProofArguments = {
    proof,
    pubSignals,
    root: toFixedHex(root),
    inputNullifiers: inputNullifiers.map(toFixedHex),
    outputCommitments: outputCommitments.map(toFixedHex) as [string, string],
    publicAmount: BigNumber.from(publicAmount),
    extDataHash: toFixedHex(extDataHash),
  };

  const input = {
    proofArguments: proofArguments,
    extData: { ...extData, extAmount: BigNumber.from(extData.extAmount) },
  };

  return input;
}
