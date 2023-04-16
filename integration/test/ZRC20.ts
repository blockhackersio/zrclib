// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account, Keypair, ShieldedPool } from "@zrclib/tools";

import path from "path";
import { MockToken__factory, ZRC20__factory } from "../typechain-types";
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
  const [owner] = await ethers.getSigners();

  // Deploy contracts
  console.log("Deploying contracts...");
  const hasher = await Hasher.deploy();
  const tokenFactory = new MockToken__factory(owner);
  const mockErc20 = await tokenFactory.deploy(1e7);
  await mockErc20.deployed();

  const zrc20Factory = new ZRC20__factory(owner);
  const zrc20 = await zrc20Factory.deploy(hasher.address, mockErc20.address);

  expect(await mockErc20.balanceOf(owner.address)).to.eq(1e7);

  // Create approver
  const keypair = await Keypair.generate();
  const account = new Account(keypair);
  const prover = ShieldedPool.getProver(account);

  // Create proof
  console.log("Creating shield proof...");
  const shieldProof = await prover.shield(1e7);

  // call verify proof
  console.log("Approving ERC20 payment...");
  await mockErc20.approve(zrc20.address, 1e7);

  console.log("Submitting transaction...");
  await zrc20.transact(shieldProof);

  console.log("Checking ERC20 balance...");
  expect(await mockErc20.balanceOf(owner.address)).to.eq(0);

  // transfer
  const transferAmount = 5e6;
  // receiver has to send sender a public keypair
  const receiverKeypair = await Keypair.generate();
  const receiverAddress = receiverKeypair.address(); // contains only the public key
  console.log("Creating transfer proof...");
  const zrcTransferProof = await prover.transfer(
    transferAmount,
    receiverAddress
  );
  console.log("Submitting transaction...");
  await zrc20.transfer(zrcTransferProof);
  console.log("Ok");
});