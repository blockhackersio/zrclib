/* eslint-disable no-console */
const { MerkleTree } = require("fixed-merkle-tree");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const {
  toFixedHex,
  poseidonHash2,
  getExtDataHash,
  FIELD_SIZE,
  shuffle,
} = require("./utils");
const circomlib = require("circomlibjs");
const Utxo = require("./utxo");
const { Keypair } = require("./keypair");
const { plonk } = require("snarkjs");
const ff = require("ffjavascript");

const MERKLE_TREE_HEIGHT = 5;

async function generateProof(inputs) {
  const { proof } = await plonk.fullProve(
    inputs,
    `../tools/compiled/transaction_js/transaction.wasm`,
    `../tools/compiled/transaction.zkey`
  );

  const calldata = await plonk.exportSolidityCallData(proof, []);
  const [proofString] = calldata.split(",");

  return proofString;
}

async function buildMerkleTree() {
  poseidon = await circomlib.buildPoseidon();
  const poseidonHash2 = (a, b) => poseidon([a, b]);
  // TODO: get the leaves, if any
  return new MerkleTree(MERKLE_TREE_HEIGHT, [], {
    hashFunction: poseidonHash2,
    zeroElement:
      "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  });
}

async function getProof({
  inputs,
  outputs,
  tree,
  extAmount,
  fee,
  recipient,
  relayer,
  isL1Withdrawal,
  l1Fee,
}) {
  const poseidon = await circomlib.buildPoseidon();
  inputs = shuffle(inputs);
  outputs = shuffle(outputs);

  let inputMerklePathIndices = [];
  let inputMerklePathElements = [];

  for (const input of inputs) {
    if (input.amount > 0) {
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

  inputNullifier = [];
  const extDataHash = getExtDataHash(extData);
  for (const input of inputs) {
    const nullifier = await input.getNullifier();
    inputNullifier.push(poseidon.F.toObject(nullifier));
  }
  outputCommitment = [];
  for (const output of outputs) {
    const commitment = await output.getCommitment();
    outputCommitment.push(poseidon.F.toObject(commitment));
  }
  let input = {
    root: poseidon.F.toObject(
      tree._layers[tree.levels][0] ?? tree._zeros[tree.levels]
    ),
    inputNullifier: inputNullifier,
    outputCommitment: outputCommitment,
    publicAmount: BigNumber.from(extAmount)
      .sub(fee)
      .add(FIELD_SIZE)
      .mod(FIELD_SIZE)
      .toString(),
    extDataHash: BigInt(extDataHash),

    // data for 2 transaction inputs
    inAmount: inputs.map((x) => BigInt(x.amount)),
    inPrivateKey: inputs.map((x) => BigInt(x.keypair.privkey)),
    inBlinding: inputs.map((x) => BigInt(x.blinding)),
    inPathIndices: inputMerklePathIndices,
    inPathElements: inputMerklePathElements,

    // data for 2 transaction outputs
    outAmount: outputs.map((x) => BigInt(x.amount)),
    outBlinding: outputs.map((x) => BigInt(x.blinding)),
    outPubkey: outputs.map((x) => poseidon.F.toObject(x.keypair.pubkey)),
  };

  const proof = await generateProof(ff.utils.stringifyBigInts(input));

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
    args,
  };
}

async function prepareTransaction({
  inputs = [],
  outputs = [],
  fee = 0,
  recipient = 0,
  relayer = 0,
  isL1Withdrawal = false,
  l1Fee = 0,
}) {
  while (inputs.length < 2) {
    const keypair = await Keypair.create();
    inputs.push(new Utxo({ keypair: keypair }));
  }
  while (outputs.length < 2) {
    const keypair = await Keypair.create();
    outputs.push(new Utxo({ keypair: keypair }));
  }

  let extAmount = BigNumber.from(fee)
    .add(outputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)))
    .sub(inputs.reduce((sum, x) => sum.add(x.amount), BigNumber.from(0)));

  const { args, extData } = await getProof({
    inputs,
    outputs,
    tree: await buildMerkleTree(),
    extAmount,
    fee,
    recipient,
    relayer,
    isL1Withdrawal,
    l1Fee,
  });
  return {
    args,
    extData,
  };
}

module.exports = { prepareTransaction, buildMerkleTree };
