// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account } from "@zrclib/sdk";
import {
  DefiantDeposit,
  DefiantDepositProxy__factory,
  DefiantDeposit__factory,
  DefiantPool__factory,
  DefiantWithdrawalProxy__factory,
  DefiantWithdrawal__factory,
  MockErc20__factory,
  Verifier__factory,
} from "../typechain-types";
import { expect } from "chai";
import artifact from "../../sdk/contracts/generated/Hasher.json";
import { sleep, tend, time } from "../utils";
import { BigNumberish, Signer } from "ethers";
import { MockErc20 } from "../typechain-types/contracts/mocks/MockErc20.sol";

async function deploy() {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  // Deploy the MockToken
  const tokenFactory = new MockErc20__factory(deployer);
  const token = await tokenFactory.deploy();

  // Deploy the poseidon hasher
  const { abi, bytecode } = artifact;
  const Hasher = await ethers.getContractFactory(abi, bytecode);
  const hasher = await Hasher.deploy();

  // Deploy the Verifier
  const verifierFactory = new Verifier__factory(deployer);
  const verifier = await verifierFactory.deploy();

  // DefiantPool
  const poolFactory = new DefiantPool__factory(deployer);
  const pool = await poolFactory.deploy(hasher.address, verifier.address);

  // DefiantDeposit
  const depositFactory = new DefiantDeposit__factory(deployer);
  const depositImpl = await depositFactory.deploy(pool.address, token.address);

  // DefiantWithdrawal
  const withdrawalFactory = new DefiantWithdrawal__factory(deployer);
  const withdrawalImpl = await withdrawalFactory.deploy(
    pool.address,
    token.address
  );

  return { pool, token, depositImpl, withdrawalImpl };
}

async function deposit(
  amount: BigNumberish,
  account: Account,
  signer: Signer,
  token: MockErc20
) {
  // Deploy proxy contract
  const depositProxyFactory = new DefiantDepositProxy__factory(signer);
  const depositProxy = await depositProxyFactory.deploy();
  await depositProxy.deployed();
  console.log(`depositContract: ${depositProxy.address}`);
  const depositContract = DefiantDeposit__factory.connect(
    depositProxy.address,
    signer
  );

  // Approve token spend
  let tx = await token.connect(signer).approve(depositContract.address, amount);
  await tx.wait();

  // Create proof
  const proof = await account.proveShield(amount);

  // Submit transaction
  tx = await depositContract.deposit(proof);
  await tx.wait();

  console.log("Deposited to contract");
}

async function withdrawal(
  amount: BigNumberish,
  account: Account,
  signer: Signer
) {
  // Deploy proxy contract
  const withdrawalProxyFactory = new DefiantWithdrawalProxy__factory(signer);
  const withdrawalProxy = await withdrawalProxyFactory.deploy();
  await withdrawalProxy.deployed();
  console.log(`withdrawalContract.address: ${withdrawalProxy.address}`);
  const withdrawalContract = DefiantWithdrawal__factory.connect(
    withdrawalProxy.address,
    signer
  );

  // Create proof
  const proof = await account.proveUnshield(amount, await signer.getAddress());

  // Submit transaction
  let tx = await withdrawalContract.withdraw(proof);
  await tx.wait();

  console.log("Withdrawaled from contract");
}

it("should deposit", async () => {
  // Setup
  const [, aliceEth, bobEth, charlieEth] = await ethers.getSigners();
  console.log("aliceEth.address: " + aliceEth.address);

  let t = time("Setup contracts");
  const { token, pool } = await deploy();
  let tx = await token.mint(aliceEth.address, 100_000000);
  await tx.wait();
  tend(t);

  t = time("Setup account");
  const alice = await Account.create(pool, "password123");
  await alice.loginWithEthersSigner(aliceEth);
  const bob = await Account.create(pool, "password123");
  await bob.loginWithEthersSigner(bobEth);
  tend(t);

  // Deposit
  t = time("deposit");
  await deposit(100_000000, alice, aliceEth, token);
  tend(t);

  await sleep(10_000);

  // Check balances
  t = time("get balances");
  let alicePrivateBal = await alice.getBalance();
  expect(alicePrivateBal.toNumber()).to.eq(100_000000);
  let alicePublicBal = await token.balanceOf(aliceEth.address);
  expect(alicePublicBal.toNumber()).to.eq(0);
  tend(t);

  // Withdraw
  t = time("withdraw");
  await withdrawal(100_000000, alice, aliceEth);
  await sleep(10_000);
  tend(t);

  // Check balances
  t = time("get balances");
  alicePrivateBal = await alice.getBalance();
  expect(alicePrivateBal.toNumber()).to.eq(0);
  alicePublicBal = await token.balanceOf(aliceEth.address);
  expect(alicePublicBal.toNumber()).to.eq(100_000000);
  tend(t);

  alice.destroy();
  bob.destroy();
});
