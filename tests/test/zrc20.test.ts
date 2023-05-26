// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account } from "@zrclib/sdk";
import {
  Verifier__factory,
  ZRC20__factory,
  SwapExecutor__factory,
} from "../typechain-types";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import { tend, time, waitUntil } from "../utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

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

  // Deploy the Swap Executor
  const swapExecutorFactory = new SwapExecutor__factory(deployer);
  const swapExecutor = await swapExecutorFactory.deploy();

  // Deploy the ZRC20 passing in the hasher and verifier
  const zrc20Factory = new ZRC20__factory(deployer);
  const contract = await zrc20Factory.deploy(
    hasher.address,
    verifier.address,
    swapExecutor.address
  );

  return { contract };
}

// XXX: Fix test not working ConstraintError
it.skip("Test zrc20 transfer", async function () {
  const TEN = 10 * 1_000_000;
  const FIVE = 5 * 1_000_000;

  let { contract } = await loadFixture(deployZrc);

  const [deployer, aliceEth, bobEth] = await ethers.getSigners();

  // CREATE ACCOUNTS
  const alice = await Account.create(contract, aliceEth, "password123");
  await alice.login();

  const bob = await Account.create(contract, bobEth, "password123");
  await bob.login();

  let tx, t, proof;

  // MINT TOKENS
  contract = contract.connect(deployer);
  tx = await contract.mint(aliceEth.address, TEN);
  await tx.wait();

  contract = contract.connect(aliceEth);

  /// DEPOSIT
  t = time("Alice creates shield proof for 10 coins");
  proof = await alice.proveShield(TEN);
  tend(t);

  t = time("Alice approves ERC20 payment");
  tx = await contract.approve(contract.address, TEN);
  await tx.wait();
  tend(t);

  t = time("Alice submits transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  /// Check balances
  t = time("Check that Alice's ERC20 balance is 0");
  await waitUntil(
    () => contract.balanceOf(aliceEth.address),
    (bal) => bal.eq(0)
  );
  tend(t);

  t = time("Check Alice's private balance is 10");
  await waitUntil(
    () => alice.getBalance(),
    (bal) => bal.eq(TEN)
  );
  tend(t);

  /// TRANSFER
  const bobKeypair = bob.getKeypair(); // receiver has to send sender a public keypair
  const bobPubkey = bobKeypair.address(); // contains only the public key

  t = time("Alice creates a proof to transfer 5 coins to Bob");
  proof = await alice.proveTransfer(FIVE, bobPubkey);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await contract.transact(proof);
  await tx.wait();
  tend(t);

  // Check private balances
  t = time("Check Alice's private balance is 5");
  await waitUntil(
    () => alice.getBalance(),
    (bal) => bal.eq(FIVE)
  );
  tend(t);

  t = time("Check Bob's private balance is 5");
  await waitUntil(
    () => bob.getBalance(),
    (bal) => bal.eq(FIVE)
  );
  tend(t);

  /// WITHDRAW

  t = time("Alice creates a proof to unshield 5");
  proof = await alice.proveUnshield(FIVE, aliceEth.address);
  tend(t);

  t = time("Alice submits her transaction");
  tx = await contract.transact(proof);
  tx.wait();
  tend(t);

  /// Check balances
  t = time("Check Alice's public balance is 5");
  await waitUntil(
    () => contract.balanceOf(aliceEth.address),
    (bal) => bal.eq(FIVE)
  );
  tend(t);

  await alice.destroy();
  await bob.destroy();

  console.log("Ok");
});
