// Need this or ethers fails in node
import crypto from "crypto";
(globalThis as any).crypto = crypto;

import { expect } from "chai";
import { ethers } from "hardhat";
// @ts-ignore-line
import Utxo from "../utils/utxo";
// @ts-ignore-line
import { Keypair } from "../utils/keypair";
// @ts-ignore-line
import { prepareTransaction } from "../utils/index";
// @ts-ignore-line
import { toFixedHex } from "../utils/utils";

// // XXX:NEW
// import { Account, Keypair, Zrc20, toFixedHex } from "@zrclib/tools";
// // XXX:NEW

import path from "path";

const artifactPath = path.join(
  __dirname,
  "../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

it("Test transfer", async function () {
  const sender = (await ethers.getSigners())[0];

  const Hasher = await ethers.getContractFactory(
    artifact.abi,
    artifact.bytecode
  );
  const hasher = await Hasher.deploy();

  const MyPool = await ethers.getContractFactory("MyPool");
  const pool = await MyPool.deploy(hasher.address);

  // THE FOLLOWING IS NEW CODE
  // const keypair = await Keypair.generate();
  // const account = new Account(keypair);
  // const zrc20 = new Zrc20(account);

  // const { args, extData } = await zrc20.mint(1e7);
  // END NEW CODE

  //deposit parameter
  const depositAmount = 1e7;
  const keypair = await Keypair.create();
  const deposit = new Utxo({ amount: depositAmount, keypair: keypair });

  let { args, extData } = await prepareTransaction({
    outputs: [deposit],
    account: {
      owner: sender.address,
      publicKey: deposit.keypair.address(),
    },
  });

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
