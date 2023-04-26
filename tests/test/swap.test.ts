// Need this or ethers fails in node

import { ethers } from "hardhat";
import { Account } from "@zrclib/sdk";
import {
  MockErc20__factory,
  MultiAssetShieldedPool__factory,
  Verifier__factory,
  SwapExecutor__factory,
} from "../typechain-types";
import { expect } from "chai";
import artifact from "@zrclib/sdk/contracts/generated/Hasher.json";
import { sleep, tend, time } from "../utils";

async function deployERC20Token(name: string, symbol: string) {
  // Prepare signers
  const [deployer] = await ethers.getSigners();

  const erc20Factory = new MockErc20__factory(deployer);
  const token = await erc20Factory.deploy(name, symbol);

  return token;
}

async function deployMultiAssetShieldedPool() {
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

  // Deploy the multi asset shielded pool
  const maspFactory = new MultiAssetShieldedPool__factory(deployer);
  const contract = await maspFactory.deploy(
    hasher.address,
    verifier.address,
    swapExecutor.address
  );

  return { contract };
}

it("Test swap", async function () {
  const TEN = 10 * 1_000_000;
  const FIVE = 5 * 1_000_000;

  let { contract } = await deployMultiAssetShieldedPool();
  let tokenA = await deployERC20Token("LUSD", "LUSD");
  let tokenB = await deployERC20Token("DAI", "DAI");

  const [deployer, aliceEth, bobEth] = await ethers.getSigners();

  // CREATE ACCOUNTS
  const alice = await Account.create(contract, aliceEth, "password123");
  await alice.login();

  const bob = await Account.create(contract, bobEth, "password123");
  await bob.login();

  let tx, t, proof, publicBalance, privateBalance;
});
