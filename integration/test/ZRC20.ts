// Need this or ethers fails in node

import { ethers } from "hardhat";
import { ShieldedAccount } from "@zrclib/tools";

import path from "path";
import { Verifier__factory, ZRC20__factory } from "../typechain-types";
import { expect } from "chai";
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function time(log: string) {
  const started = Date.now();
  console.log(`${log}... `);
  return started;
}

function tend(started: number) {
  console.log(`${Date.now() - started}ms`);
}

const artifactPath = path.join(
  __dirname,
  "../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

async function deployZrc() {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  // Deploy the poseidon hasher
  const { abi, bytecode } = artifact;
  const Hasher: any = await ethers.getContractFactory(abi, bytecode);
  const hasher = await Hasher.deploy();

  // Deploy the Verifier
  const verifierFactory = new Verifier__factory(deployer);
  const verifier = await verifierFactory.deploy();

  // Deploy the ZRC20 passing in the hasher and verifier
  const zrc20Factory = new ZRC20__factory(deployer);
  const zrc20 = await zrc20Factory.deploy(hasher.address, verifier.address);

  return { zrc20 };
}

it("Test transfer", async function () {
  const TEN = 10 * 1_000_000;
  const FIVE = 5 * 1_000_000;

  let { zrc20 } = await deployZrc();

  const [deployer, aliceSigner, bobSigner] = await ethers.getSigners();

  // CREATE ACCOUNTS
  const alice = await ShieldedAccount.create(zrc20, "password123");
  await alice.loginWithEthersSigner(aliceSigner);

  const bob = await ShieldedAccount.create(zrc20, "password123");
  await bob.loginWithEthersSigner(bobSigner);

  let tx, t;

  // MINT TOKENS
  zrc20 = zrc20.connect(deployer);
  tx = await zrc20.mint(aliceSigner.address, TEN);
  await tx.wait();

  zrc20 = zrc20.connect(aliceSigner);

  /// DEPOSIT
  t = time("Creating shield proof");
  const shieldProof = await alice.shield(TEN);
  tend(t);

  t = time("Approving ERC20 payment");
  tx = await zrc20.approve(zrc20.address, TEN);
  await tx.wait();
  tend(t);

  t = time("Submitting transaction");
  tx = await zrc20.transact(shieldProof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Getting ERC20 balance");
  const publicBalance = await zrc20.balanceOf(aliceSigner.address);
  expect(publicBalance).to.eq(0);
  tend(t);

  t = time("Getting private balance");
  const privateBalance = await alice.getBalance();
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)
  tend(t);

  /// TRANSFER
  const bobKeypair = bob.getKeypair(); // receiver has to send sender a public keypair
  const bobPubkey = bobKeypair.address(); // contains only the public key

  t = time("Creating transfer proof");
  const zrcTransferProof = await alice.transfer(FIVE, bobPubkey);
  tend(t);

  t = time("Submitting transaction");
  tx = await zrc20.transact(zrcTransferProof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  // Check private balances
  t = time("Getting alices private balance");
  const alicePrivateBal = await alice.getBalance();
  tend(t);

  t = time("Getting bobs private balance");
  const bobPrivateBal = await bob.getBalance();
  tend(t);

  expect(alicePrivateBal).to.eq(FIVE);
  expect(bobPrivateBal).to.eq(FIVE);

  /// WITHDRAW

  t = time("Creating withdraw proof");
  const withdrawProof = await alice.unshield(FIVE, aliceSigner.address);
  tend(t);

  t = time("Submitting transaction");
  tx = await zrc20.transact(withdrawProof);
  tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Getting ERC20 balance");
  const publicBalance2 = await zrc20.balanceOf(aliceSigner.address);
  expect(publicBalance2).to.eq(FIVE);
  tend(t);

  console.log("Ok");
});
