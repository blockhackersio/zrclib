// Need this or ethers fails in node

import { ethers, network } from "hardhat";
import { Account } from "@zrclib/sdk";
import {
  DefiantDepositProxy__factory,
  DefiantDeposit__factory,
  DefiantPool,
  DefiantPool__factory,
  DefiantWithdrawalProxy__factory,
  DefiantWithdrawal__factory,
  MockErc20__factory,
  MockErc20,
  Verifier__factory,
  SwapExecutor__factory,
  WithdrawalAmountManagerTester__factory,
} from "../typechain-types";
import { expect } from "chai";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import { tend, time, waitUntil } from "../utils";
import { BigNumber, BigNumberish, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deploy() {
  // Prepare signers
  const [deployer, temp] = await ethers.getSigners();

  // Deploy the MockToken
  const tokenFactory = new MockErc20__factory(deployer);
  const token = await tokenFactory.deploy("Fake Ether", "ETH");

  // Deploy the poseidon hasher
  const { abi, bytecode } = artifact;
  const Hasher = await ethers.getContractFactory(abi, bytecode);
  const hasher = await Hasher.deploy();

  // Deploy the Verifier
  const verifierFactory = new Verifier__factory(deployer);
  const verifier = await verifierFactory.deploy();
  await verifier.deployed();

  // Deploy the Swap Executor
  const swapExecutorFactory = new SwapExecutor__factory(temp);
  const swapExecutor = await swapExecutorFactory.deploy();
  await swapExecutor.deployed();

  // DefiantPool
  const poolFactory = new DefiantPool__factory(deployer);
  const pool = await poolFactory.deploy(
    hasher.address,
    verifier.address,
    swapExecutor.address
  );
  await pool.deployed();

  // DefiantDeposit
  const depositFactory = new DefiantDeposit__factory(deployer);
  const depositImpl = await depositFactory.deploy(pool.address, token.address);
  await depositImpl.deployed();

  // DefiantWithdrawal
  const withdrawalFactory = new DefiantWithdrawal__factory(deployer);
  const withdrawalImpl = await withdrawalFactory.deploy(
    pool.address,
    token.address
  );
  await withdrawalImpl.deployed();

  return { pool, token, depositImpl, withdrawalImpl };
}

async function deposit(
  amount: BigNumberish,
  account: Account,
  token: MockErc20
) {
  // Deploy proxy contract
  const depositProxyFactory = new DefiantDepositProxy__factory(account.signer);
  const depositProxy = await depositProxyFactory.deploy();
  await depositProxy.deployed();
  console.log(`depositContract: ${depositProxy.address}`);
  const depositContract = DefiantDeposit__factory.connect(
    depositProxy.address,
    account.signer
  );

  // Approve token spend
  let tx = await token
    .connect(account.signer)
    .approve(depositContract.address, amount);
  await tx.wait();

  // Create proof
  const proof = await account.proveShield(amount);

  // Submit transaction
  console.log("Submitting to deposit contract");
  tx = await depositContract.deposit(proof);
  await tx.wait();

  console.log("Deposited to contract");
}

async function withdrawal(amount: BigNumberish, account: Account) {
  // Deploy proxy contract
  const withdrawalProxyFactory = new DefiantWithdrawalProxy__factory(
    account.signer
  );
  const withdrawalProxy = await withdrawalProxyFactory.deploy();
  await withdrawalProxy.deployed();
  console.log(`withdrawalContract.address: ${withdrawalProxy.address}`);
  const withdrawalContract = DefiantWithdrawal__factory.connect(
    withdrawalProxy.address,
    account.signer
  );

  // Create proof
  const proof = await account.proveUnshield(
    amount,
    await account.signer.getAddress()
  );

  // Submit transaction
  let tx = await withdrawalContract.withdraw(proof);
  await tx.wait();

  console.log("Withdrawaled from contract");
}

async function transfer(
  pool: DefiantPool,
  amount: BigNumberish,
  sender: Account,
  recipient: Account
) {
  // Create proof
  const proof = await sender.proveTransfer(
    amount,
    recipient.getKeypair().address(),
    0
  );

  // Submit transaction
  let tx = await pool.transact(proof);
  await tx.wait();
  console.log("Transacted");
}

it("WithdrawalAmountManager", async () => {
  // Using other deployer to prevent deterministic contract
  // addresses from not matching proxies
  const [, deployer, a, b, c] = await ethers.getSigners();

  const factory = new WithdrawalAmountManagerTester__factory(deployer);
  const contract = await factory.deploy();
  await contract.deployed();

  let tx = await contract.addDeposit(a.address, 100);
  await tx.wait();
  tx = await contract.addDeposit(b.address, 100);
  await tx.wait();
  const [arr, len] = await contract.getWithdrawalAmounts(150);
  const [one, two] = arr.slice(0, len);
  expect([one, two]).to.eql([
    [a.address, BigNumber.from(100)],
    [b.address, BigNumber.from(50)],
  ]);
});

// XXX: skipping because there is something about this that is causing issues with the event test
it.skip("should deposit", async () => {
  // Setup
  const [, aliceEth, bobEth, charlieEth] = await ethers.getSigners();
  console.log("aliceEth.address: " + aliceEth.address);

  let t = time("Setup contracts");
  const { token, pool } = await loadFixture(deploy);
  let tx = await token.mint(aliceEth.address, 100_000000);
  await tx.wait();
  tx = await token.mint(charlieEth.address, 100_000000);
  await tx.wait();
  tend(t);

  t = time("Setup account and login");
  const alice = await Account.create(pool, aliceEth, "password123");
  await alice.login();
  const bob = await Account.create(pool, bobEth, "password123");
  await bob.login();
  const charlie = await Account.create(pool, charlieEth, "password123");
  await charlie.login();
  tend(t);

  // Deposit
  t = time("alice deposit");
  await deposit(100_000000, alice, token);
  tend(t);

  t = time("charlie deposit");
  await deposit(100_000000, charlie, token);
  tend(t);

  // Check balances
  t = time("get balances");
  await waitUntil(
    () => alice.getBalance(),
    (bal) => bal.eq(100_000000)
  );

  await waitUntil(
    () => charlie.getBalance(),
    (bal) => bal.eq(100_000000)
  );

  await waitUntil(
    () => token.balanceOf(aliceEth.address),
    (bal) => bal.eq(0)
  );
  tend(t);

  // Transfer
  t = time("transfer");
  await transfer(pool, 75_000000, alice, bob);
  await transfer(pool, 75_000000, charlie, bob);
  // await sleep(10_000);
  tend(t);

  t = time("get balances");
  await waitUntil(
    () => alice.getBalance(),
    (bal) => bal.eq(25_000000)
  );

  await waitUntil(
    () => charlie.getBalance(),
    (bal) => bal.eq(25_000000)
  );

  await waitUntil(
    () => bob.getBalance(),
    (bal) => bal.eq(150_000000)
  );
  tend(t);

  // Withdraw
  t = time("withdraw");
  await withdrawal(150_000000, bob);
  tend(t);

  // Check balances
  t = time("get balances");
  await waitUntil(
    () => bob.getBalance(),
    (bal) => bal.eq(0)
  );

  await waitUntil(
    () => token.balanceOf(bobEth.address),
    (bal) => bal.eq(150_000000)
  );
  tend(t);

  await alice.destroy();
  await bob.destroy();
  await charlie.destroy();
});
