// Need this or ethers fails in node

import { ethers } from "hardhat";
import { ShieldedAccount, Keypair, ShieldedPool } from "@zrclib/tools";

import path from "path";
import { MockToken__factory, ZRC20__factory } from "../typechain-types";
import { expect } from "chai";
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
async function t<T>(
  log: string,
  promiseOrFn: Promise<T> | (() => Promise<T>)
): Promise<T> {
  const prom = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
  const started = Date.now();
  process.stdout.write(`${log}... `);
  const result = await prom;
  console.log(`${Date.now() - started}ms`);
  return result;
}

const artifactPath = path.join(
  __dirname,
  "../../tools/contracts/generated/Hasher.json"
);
const artifact = require(artifactPath);

async function deploy({ mintAmount }: { mintAmount: number }) {
  const Hasher: any = await ethers.getContractFactory(
    artifact.abi,
    artifact.bytecode
  );
  const [source, reciever] = await ethers.getSigners();
  const hasher = await Hasher.deploy();
  const tokenFactory = new MockToken__factory(source);

  const mockErc20 = await tokenFactory.deploy(mintAmount);
  await mockErc20.deployed();

  const zrc20Factory = new ZRC20__factory(source);
  const zrc20 = await zrc20Factory.deploy(hasher.address, mockErc20.address);
  return { zrc20, mockErc20, signers: [source, reciever] };
}

it("Test transfer", async function () {
  const deposit = 10 * 1_000_000;

  const {
    zrc20,
    mockErc20,
    signers: [source, reciever],
  } = await deploy({ mintAmount: deposit });

  expect(await mockErc20.balanceOf(source.address)).to.eq(deposit);

  // Create approver
  const account = await ShieldedAccount.create(zrc20, "password123");
  await account.loginWithEthersSigner(source);
  const prover = account.getProver();

  // Create proof
  const shieldProof = await t("Creating shield proof", prover.shield(deposit));

  // call verify proof
  await t("Approving ERC20 payment", mockErc20.approve(zrc20.address, deposit));
  const tx = await t("Submitting transaction", zrc20.transact(shieldProof));
  await tx.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)
  const publicBalance = await t(
    "Getting ERC20 balance",
    mockErc20.balanceOf(source.address)
  );

  expect(publicBalance).to.eq(0);
  const privateBalance = await t(
    "Getting private balance",
    account.getBalance()
  );
  expect(privateBalance).to.eq(deposit); // Transfer to the darkside worked! :)

  // transfer
  // XXXXXXXX: Next we need to get the merkletree updating based on the commitment events added
  // See prepare_transaction.ts

  const transferAmount = 5 * 1_000_000;

  // receiver has to send sender a public keypair
  const receiverKeypair = await Keypair.fromSigner(reciever);
  const receiverAddress = receiverKeypair.address(); // contains only the public key
  const zrcTransferProof = await t(
    "Creating transfer proof",
    prover.transfer(transferAmount, receiverAddress)
  );
  const tx2 = await t(
    "Submitting transaction",
    zrc20.transact(zrcTransferProof)
  );
  await tx2.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)

  const privateBalance2 = await t(
    "Getting private balance",
    account.getBalance()
  );
  expect(privateBalance2).to.eq(transferAmount);
  console.log("Ok");
});
