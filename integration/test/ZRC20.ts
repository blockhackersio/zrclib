// Need this or ethers fails in node

import { ethers } from "hardhat";
import { ShieldedAccount, Keypair, ShieldedPool } from "@zrclib/tools";

import path from "path";
import { MockToken__factory, ZRC20__factory } from "../typechain-types";
import { expect } from "chai";

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

it("Test transfer", async function () {
  const Hasher: any = await ethers.getContractFactory(
    artifact.abi,
    artifact.bytecode
  );
  const [source, reciever] = await ethers.getSigners();

  // Deploy contracts
  const deposit = 10 * 1_000_000;
  const { zrc20, mockErc20 } = await t("Deploying contracts", async () => {
    const hasher = await Hasher.deploy();
    const tokenFactory = new MockToken__factory(source);

    const mockErc20 = await tokenFactory.deploy(deposit);
    await mockErc20.deployed();

    const zrc20Factory = new ZRC20__factory(source);
    const zrc20 = await zrc20Factory.deploy(hasher.address, mockErc20.address);
    return { zrc20, mockErc20 };
  });

  expect(await mockErc20.balanceOf(source.address)).to.eq(deposit);

  // Create approver
  const account = await ShieldedAccount.fromSigner(source);
  const prover = ShieldedPool.getProver(account);

  // Create proof
  const shieldProof = await t("Creating shield proof", prover.shield(deposit));

  // call verify proof
  await t("Approving ERC20 payment", mockErc20.approve(zrc20.address, deposit));
  await t("Submitting transaction", zrc20.transact(shieldProof));

  const bal = await t(
    "Getting ERC20 balance",
    mockErc20.balanceOf(source.address)
  );

  expect(bal).to.eq(0);

  // transfer
  const transferAmount = 5 * 1_000_000;

  // receiver has to send sender a public keypair
  const receiverKeypair = await Keypair.fromSigner(reciever);
  const receiverAddress = receiverKeypair.address(); // contains only the public key
  const zrcTransferProof = await t(
    "Creating transfer proof",
    prover.transfer(transferAmount, receiverAddress)
  );

  await t("Submitting transaction", zrc20.transfer(zrcTransferProof));
  console.log("Ok");
});
