// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account, Keypair, Zrc20, toFixedHex, ZrcProof } from "@zrclib/tools";

import path from "path";
import { expect } from "chai";

const artifactPath = path.join(
  __dirname,
  "../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

it("Test transfer", async function () {
  // initialize contracts
  const Hasher = await ethers.getContractFactory(
    artifact.abi,
    artifact.bytecode
  );
  const hasher = await Hasher.deploy();
  const MyPool = await ethers.getContractFactory("MyPool");
  const pool = await MyPool.deploy(hasher.address);

  // deposit and zrc20 parameter
  const depositAmount = 1e7;
  const keypair = await Keypair.generate();
  const account = new Account(keypair);
  const zrc20 = new Zrc20(account);

  // generate proof through zrc20 sdk
  const zrcMintProof = await zrc20.mint(depositAmount);
  const mintInput = await formatArguments(zrcMintProof);

  // send transaction to contract
  const mintAmount = 10;
  await pool.mint(mintAmount, mintInput);
  expect(await pool.totalSupply()).to.be.equal(mintAmount);

  // transfer 
  const transferAmount = 5;
  // receiver has to send sender a public keypair
  const receiverKeypair = await Keypair.generate();
  const receiverAddress = receiverKeypair.address(); // contains only the public key
  const zrcTransferProof = await zrc20.transfer(transferAmount, receiverAddress);
  const transferInput = await formatArguments(zrcTransferProof);
  await pool.transfer(transferInput);
});

async function formatArguments(zrcProof: ZrcProof) {
  const args = zrcProof.args;
  const extData = zrcProof.extData;

  // prepare proof arguments to the correct format
  const proof = args["proof"];
  let pubSignals = [];
  pubSignals.push(args["root"]);
  pubSignals.push(args["publicAmount"]);
  pubSignals.push(args["extDataHash"]);
  for (const element of args["inputNullifiers"]) {
    pubSignals.push(element);
  }
  for (const element of args["outputCommitments"]) {
    pubSignals.push(element);
  }

  const proofArguments = {
    proof: proof,
    pubSignals: pubSignals,
    root: toFixedHex(args["root"]),
    inputNullifiers: args["inputNullifiers"].map((x: bigint) => toFixedHex(x)),
    outputCommitments: args["outputCommitments"].map((x: bigint) =>
      toFixedHex(x)
    ),
    publicAmount: args["publicAmount"],
    extDataHash: toFixedHex(args["extDataHash"]),
  };

  const input = {
    proofArguments: proofArguments,
    extData: extData,
  };

  return input;
}
