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

const ZERO_LEAVES = [
  0x2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6cn,
  0x1a332ca2cd2436bdc6796e6e4244ebf6f7e359868b7252e55342f766e4088082n,
  0x2fb19ac27499bdf9d7d3b387eff42b6d12bffbc6206e81d0ef0b0d6b24520ebdn,
  0x18d0d6e282d4eacbf18efc619a986db763b75095ed122fac7d4a49418daa42e1n,
  0x054dec40f76a0f5aaeff1a85a4a3721b92b4ad244362d30b0ef8ed7033de11d3n,
  0x1d24c91f8d40f1c2591edec19d392905cf5eb01eada48d71836177ef11aea5b2n,
  0x0fb63621cfc047eba2159faecfa55b120d7c81c0722633ef94e20e27675e378fn,
  0x277b08f214fe8c5504a79614cdec5abd7b6adc9133fe926398684c82fd798b44n,
  0x2633613437c1fd97f7c798e2ea30d52cfddee56d74f856a541320ae86ddaf2den,
  0x00768963fa4b993fbfece3619bfaa3ca4afd7e3864f11b09a0849dbf4ad25807n,
  0x0e63ff9df484c1a21478bd27111763ef203177ec0a7ef3a3cd43ec909f587bb0n,
  0x0e6a4bfb0dd0ac8bf5517eaac48a95ba783dabe9f64494f9c892d3e8431eaab3n,
  0x0164a46b3ffff8baca00de7a130a63d105f1578076838502b99488505d5b3d35n,
  0x145a6f1521c02b250cc76eb35cd67c9b0b22473577de3778e4c51903836c8957n,
  0x29849fc5b55303a660bad33d986fd156d48516ec58a0f0a561a03b704a802254n,
  0x26639dd486b374e98ac6da34e8651b3fca58c51f1c2f857dd82045f27fc8dbe6n,
  0x2aa39214b887ee877e60afdb191390344c68177c30a0b8646649774174de5e33n,
  0x09b397d253e41a521d042ffe01f8c33ae37d4c7da21af68693aafb63d599d708n,
  0x02fbfd397ad901cea38553239aefec016fcb6a19899038503f04814cbb79a511n,
  0x266640a877ec97a91f6c95637f843eeac8718f53f311bac9cba7d958df646f9dn,
  0x29f9a0a07a22ab214d00aaa0190f54509e853f3119009baecb0035347606b0a9n,
  0x0a1fda67bffa0ab3a755f23fdcf922720820b6a96616a5ca34643cd0b935e3d6n,
  0x19507199eb76b5ec5abe538a01471d03efb6c6984739c77ec61ada2ba2afb389n,
  0x26bd93d26b751484942282e27acfb6d193537327a831df6927e19cdfc73c3e64n,
  0x2eb88a9c6b00a4bc6ea253268090fe1d255f6fe02d2eb745517723aae44d7386n,
  0x13e50d0bda78be97792df40273cbb16f0dc65c0697d81a82d07d0f6eee80a164n,
  0x2ea95776929000133246ff8d9fdcba179d0b262b9e910558309bac1c1ec03d7an,
  0x1a640d6ef66e356c795396c0957b06a99891afe0c493f4d0bdfc0450764bae60n,
  0x2b17979f2c2048dd9e4ee5f482cced21435ea8cc54c32f80562e39a5016b0496n,
  0x29ba6a30de50542e261abfc7ee0c68911002d3acd4dd4c02ad59aa96805b20bbn,
  0x103fcf1c8a98ebe50285f6e669077a579308311fd44bb6895d5da7ba7fd3564en,
  0x166bdd01780976e655f5278260c638dcf10fe7c136f37c9152cbcaabef901f4dn,
  0x2712c601a9b8b2abd396a619327095d3f1ea86a6c07d6df416a3973a1a4b3ce5n,
];

// function zeros(i) {
//   if (i == 0)
//     return 0x2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6cn;
//   else if (i == 1)
//     return 0x1a332ca2cd2436bdc6796e6e4244ebf6f7e359868b7252e55342f766e4088082n;
//   else if (i == 2)
//     return 0x2fb19ac27499bdf9d7d3b387eff42b6d12bffbc6206e81d0ef0b0d6b24520ebdn;
//   else if (i == 3)
//     return 0x18d0d6e282d4eacbf18efc619a986db763b75095ed122fac7d4a49418daa42e1n;
//   else if (i == 4)
//     return 0x054dec40f76a0f5aaeff1a85a4a3721b92b4ad244362d30b0ef8ed7033de11d3n;
//   else if (i == 5)
//     return 0x1d24c91f8d40f1c2591edec19d392905cf5eb01eada48d71836177ef11aea5b2n;
//   else if (i == 6)
//     return 0x0fb63621cfc047eba2159faecfa55b120d7c81c0722633ef94e20e27675e378fn;
//   else if (i == 7)
//     return 0x277b08f214fe8c5504a79614cdec5abd7b6adc9133fe926398684c82fd798b44n;
//   else if (i == 8)
//     return 0x2633613437c1fd97f7c798e2ea30d52cfddee56d74f856a541320ae86ddaf2den;
//   else if (i == 9)
//     return 0x00768963fa4b993fbfece3619bfaa3ca4afd7e3864f11b09a0849dbf4ad25807n;
//   else if (i == 10)
//     return 0x0e63ff9df484c1a21478bd27111763ef203177ec0a7ef3a3cd43ec909f587bb0n;
//   else if (i == 11)
//     return 0x0e6a4bfb0dd0ac8bf5517eaac48a95ba783dabe9f64494f9c892d3e8431eaab3n;
//   else if (i == 12)
//     return 0x0164a46b3ffff8baca00de7a130a63d105f1578076838502b99488505d5b3d35n;
//   else if (i == 13)
//     return 0x145a6f1521c02b250cc76eb35cd67c9b0b22473577de3778e4c51903836c8957n;
//   else if (i == 14)
//     return 0x29849fc5b55303a660bad33d986fd156d48516ec58a0f0a561a03b704a802254n;
//   else if (i == 15)
//     return 0x26639dd486b374e98ac6da34e8651b3fca58c51f1c2f857dd82045f27fc8dbe6n;
//   else if (i == 16)
//     return 0x2aa39214b887ee877e60afdb191390344c68177c30a0b8646649774174de5e33n;
//   else if (i == 17)
//     return 0x09b397d253e41a521d042ffe01f8c33ae37d4c7da21af68693aafb63d599d708n;
//   else if (i == 18)
//     return 0x02fbfd397ad901cea38553239aefec016fcb6a19899038503f04814cbb79a511n;
//   else if (i == 19)
//     return 0x266640a877ec97a91f6c95637f843eeac8718f53f311bac9cba7d958df646f9dn;
//   else if (i == 20)
//     return 0x29f9a0a07a22ab214d00aaa0190f54509e853f3119009baecb0035347606b0a9n;
//   else if (i == 21)
//     return 0x0a1fda67bffa0ab3a755f23fdcf922720820b6a96616a5ca34643cd0b935e3d6n;
//   else if (i == 22)
//     return 0x19507199eb76b5ec5abe538a01471d03efb6c6984739c77ec61ada2ba2afb389n;
//   else if (i == 23)
//     return 0x26bd93d26b751484942282e27acfb6d193537327a831df6927e19cdfc73c3e64n;
//   else if (i == 24)
//     return 0x2eb88a9c6b00a4bc6ea253268090fe1d255f6fe02d2eb745517723aae44d7386n;
//   else if (i == 25)
//     return 0x13e50d0bda78be97792df40273cbb16f0dc65c0697d81a82d07d0f6eee80a164n;
//   else if (i == 26)
//     return 0x2ea95776929000133246ff8d9fdcba179d0b262b9e910558309bac1c1ec03d7an;
//   else if (i == 27)
//     return 0x1a640d6ef66e356c795396c0957b06a99891afe0c493f4d0bdfc0450764bae60n;
//   else if (i == 28)
//     return 0x2b17979f2c2048dd9e4ee5f482cced21435ea8cc54c32f80562e39a5016b0496n;
//   else if (i == 29)
//     return 0x29ba6a30de50542e261abfc7ee0c68911002d3acd4dd4c02ad59aa96805b20bbn;
//   else if (i == 30)
//     return 0x103fcf1c8a98ebe50285f6e669077a579308311fd44bb6895d5da7ba7fd3564en;
//   else if (i == 31)
//     return 0x166bdd01780976e655f5278260c638dcf10fe7c136f37c9152cbcaabef901f4dn;
//   else if (i == 32)
//     return 0x2712c601a9b8b2abd396a619327095d3f1ea86a6c07d6df416a3973a1a4b3ce5n;
//   else throw new Error("Index out of bounds");
// }

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
  // console.log(tree);
  // throw new Error("BOOM!");
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
    relayer: toFixedHex(relayer, 20),
    fee: toFixedHex(fee),
    encryptedOutput1: outputs[0].encrypt(),
    encryptedOutput2: outputs[1].encrypt(),
    isL1Withdrawal,
    l1Fee,
  };

  const extDataHash = getExtDataHash(extData);
  inputNullifier = [];
  inputNullifierArgs = [];
  for (const input of inputs) {
    const nullifier = await input.getNullifier();
    inputNullifier.push(poseidon.F.toObject(nullifier));
    inputNullifierArgs.push(toFixedHex(nullifier));
  }
  outputCommitment = [];
  outputCommitmentArgs = [];
  for (const output of outputs) {
    const commitment = await output.getCommitment();
    outputCommitment.push(poseidon.F.toObject(commitment));
    outputCommitmentArgs.push(toFixedHex(commitment));
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

  // const proof = await prove(input, `./artifacts/circuits/transaction${inputs.length}`)
  const proof = await generateProof(ff.utils.stringifyBigInts(input));

  const args = {
    proof,
    root: input.root,
    inputNullifiers: inputNullifier,
    outputCommitments: outputCommitment,
    publicAmount: input.publicAmount,
    extDataHash: extDataHash,
  }

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
  console.log({ extAmount: `${extAmount}` });

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
