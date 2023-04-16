// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account, Keypair, ShieldedPool } from "@zrclib/tools";

import path from "path";
import { MockToken__factory } from "../typechain-types";
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
  const hasher = await Hasher.deploy();
  const tokenFactory = new MockToken__factory(owner);
  const mockErc20 = await tokenFactory.deploy(1e7);
  await mockErc20.deployed();
  const ZRC20 = await ethers.getContractFactory("ZRC20");
  const token = await ZRC20.deploy(hasher.address, mockErc20.address);

  expect(await mockErc20.balanceOf(owner.address)).to.eq(1e7);

  // Create approver
  const keypair = await Keypair.generate();
  const account = new Account(keypair);
  const prover = ShieldedPool.getProver(account);

  // Create proof
  const proof = await prover.shield(1e7);

  // call verify proof
  await mockErc20.approve(token.address, 1e7);
  await token.transact(proof);

  expect(await mockErc20.balanceOf(owner.address)).to.eq(0);

  // transfer
  const transferAmount = 5e6;
  // receiver has to send sender a public keypair
  const receiverKeypair = await Keypair.generate();
  const receiverAddress = receiverKeypair.address(); // contains only the public key
  const zrcTransferProof = await prover.transfer(
    transferAmount,
    receiverAddress
  );
  await token.transfer(zrcTransferProof);
});
