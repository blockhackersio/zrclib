// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account, Keypair, Zrc20, toFixedHex } from "@zrclib/tools";

import path from "path";

const artifactPath = path.join(
  __dirname,
  "../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

it("Test transfer", async function () {
  const Hasher = await ethers.getContractFactory(
    artifact.abi,
    artifact.bytecode
  );
  const hasher = await Hasher.deploy();

  const MyPool = await ethers.getContractFactory("MyPool");
  const pool = await MyPool.deploy(hasher.address);

  //deposit parameter
  const depositAmount = 1e7;
  const keypair = await Keypair.generate();
  const account = new Account(keypair);
  const zrc20 = new Zrc20(account);

  const { args, extData } = await zrc20.mint(depositAmount);

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

  // call verify proof
  const mintAmount = 10;
  await pool.mint(mintAmount, input);
});
