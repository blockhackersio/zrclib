// Need this or ethers fails in node

import { ethers } from "hardhat";
import { ShieldedAccount } from "@zrclib/tools";
import { Verifier__factory, ZRC20__factory } from "../typechain-types";
import { expect } from "chai";
import artifact from "../../tools/contracts/generated/Hasher.json";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function time(log: string) {
  const started = Date.now();
  console.log(`${log}... `);
  return started;
}

function tend(started: number) {
  console.log(` └─ ${Date.now() - started}ms`);
}

async function deployZrc() {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  // Deploy the poseidon hasher
  const { abi, bytecode } = artifact;
  const Hasher = await ethers.getContractFactory(abi, bytecode);
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

  const [deployer, aliceEth, bobEth] = await ethers.getSigners();

  // CREATE ACCOUNTS
  const alice = await ShieldedAccount.create(zrc20, "password123");
  await alice.loginWithEthersSigner(aliceEth);

  const bob = await ShieldedAccount.create(zrc20, "password123");
  await bob.loginWithEthersSigner(bobEth);

  let tx, t, proof, publicBalance, privateBalance;

  // MINT TOKENS
  zrc20 = zrc20.connect(deployer);
  tx = await zrc20.mint(aliceEth.address, TEN);
  await tx.wait();

  zrc20 = zrc20.connect(aliceEth);

  /// DEPOSIT
  t = time("Alice creates shield proof for 10 coins");
  proof = await alice.shield(TEN);
  tend(t);

  t = time("Alice approves ERC20 payment");
  tx = await zrc20.approve(zrc20.address, TEN);
  await tx.wait();
  tend(t);

  t = time("Alice submits transaction");
  tx = await zrc20.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check that Alice's ERC20 balance is 0");
  publicBalance = await zrc20.balanceOf(aliceEth.address);
  expect(publicBalance).to.eq(0);
  tend(t);

  t = time("Check Alice's private balance is 10");
  privateBalance = await alice.getBalance();
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)
  tend(t);

  /// TRANSFER
  const bobKeypair = bob.getKeypair(); // receiver has to send sender a public keypair
  const bobPubkey = bobKeypair.address(); // contains only the public key

  t = time("Alice creates a proof to transfer 5 coins to Bob");
  proof = await alice.transfer(FIVE, bobPubkey);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await zrc20.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  // Check private balances
  t = time("Check Alice's private balance is 5");
  const alicePrivateBal = await alice.getBalance();
  tend(t);
  expect(alicePrivateBal).to.eq(FIVE);

  t = time("Check Bob's private balance is 5");
  const bobPrivateBal = await bob.getBalance();
  tend(t);
  expect(bobPrivateBal).to.eq(FIVE);

  /// WITHDRAW

  t = time("Alice creates a proof to unshield 5");
  proof = await alice.unshield(FIVE, aliceEth.address);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await zrc20.transact(proof);
  tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check Alice's public balance is 5");
  publicBalance = await zrc20.balanceOf(aliceEth.address);
  expect(publicBalance).to.eq(FIVE);
  tend(t);

  console.log("Ok");
});
