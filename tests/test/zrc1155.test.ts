// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account } from "../../sdk/src";
import { Verifier__factory, ZRC1155__factory } from "../typechain-types";
import { expect } from "chai";
import artifact from "../../sdk/contracts/generated/Hasher.json";
import { sleep, tend, time } from "../utils";

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
  const zrc1155Factory = new ZRC1155__factory(deployer);
  const contract = await zrc1155Factory.deploy(
    hasher.address,
    verifier.address
  );

  return { contract };
}

it("Test zrc1155 transfer", async function () {
  const TEN = 10 * 1_000_000;
  const FIVE = 5 * 1_000_000;

  let { contract } = await deployZrc();

  const [deployer, aliceEth, bobEth] = await ethers.getSigners();

  // DEFINE TOKENS
  const tokenA = 0;
  const tokenB = 1;

  // CREATE ACCOUNTS
  const alice = await Account.create(contract, "password123");
  await alice.loginWithEthersSigner(aliceEth);

  const bob = await Account.create(contract, "password123");
  await bob.loginWithEthersSigner(bobEth);

  let tx, t, proof, publicBalance, privateBalance;

  // MINT TOKENS
  contract = contract.connect(deployer);
  tx = await contract.mint(aliceEth.address, tokenA, TEN);
  await tx.wait();
  tx = await contract.mint(aliceEth.address, tokenB, TEN);
  await tx.wait();

  contract = contract.connect(aliceEth);

  /// DEPOSIT token A
  t = time("Alice creates shield proof for 10 coins (A)");
  proof = await alice.proveShield(TEN, tokenA);
  tend(t);

  t = time("Alice submits transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check that Alice's ERC20 balance is 0 (A)");
  publicBalance = await contract.balanceOf(aliceEth.address, tokenA);
  expect(publicBalance).to.eq(0);
  tend(t);

  t = time("Check Alice's private balance is 10 (A)");
  privateBalance = await alice.getBalance(tokenA);
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)
  tend(t);

  /// DEPOSIT token B
  t = time("Alice creates shield proof for 10 coins (B)");
  proof = await alice.proveShield(TEN, tokenB);
  tend(t);

  t = time("Alice submits transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check that Alice's ERC20 balance is 0");
  publicBalance = await contract.balanceOf(aliceEth.address, tokenB);
  expect(publicBalance).to.eq(0);
  tend(t);

  t = time("Check Alice's private balance is 10 (B)");
  privateBalance = await alice.getBalance(tokenB);
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)
  tend(t);

  /// TRANSFER
  const bobKeypair = bob.getKeypair(); // receiver has to send sender a public keypair
  const bobPubkey = bobKeypair.address(); // contains only the public key

  t = time("Alice creates a proof to transfer 5 coins to Bob (B)");
  proof = await alice.proveTransfer(FIVE, bobPubkey, tokenB);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  // Check private balances
  t = time("Check Alice's private balance is 5 (B)");
  const alicePrivateBal = await alice.getBalance(tokenB);
  tend(t);
  expect(alicePrivateBal).to.eq(FIVE);

  t = time("Check Bob's private balance is 5 (B)");
  const bobPrivateBal = await bob.getBalance(tokenB);
  tend(t);
  expect(bobPrivateBal).to.eq(FIVE);

  publicBalance = await contract.balanceOf(aliceEth.address, tokenB);

  /// WITHDRAW
  t = time("Alice creates a proof to unshield 5 (B)");
  proof = await alice.proveUnshield(FIVE, aliceEth.address, tokenB);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await contract.transact(proof);
  tx.wait();
  tend(t);

  await sleep(10_000); // Waiting for sync

  /// Check balances
  t = time("Check Alice's public balance is 5 (B)");
  publicBalance = await contract.balanceOf(aliceEth.address, tokenB);
  expect(publicBalance).to.eq(FIVE);
  tend(t);

  console.log("Ok");
});
