// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account, Keypair, ShieldedPool } from "@zrclib/tools";

import path from "path";
import { expect } from "chai";

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
  const zrc20 = new ShieldedPool(account);

  const zrcProof = await zrc20.mint(depositAmount);

  // call verify proof
  const mintAmount = 10;
  await pool.mint(mintAmount, zrcProof);
  expect(await pool.totalSupply()).to.be.equal(mintAmount);
});
