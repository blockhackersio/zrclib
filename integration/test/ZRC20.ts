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
  const TEN = 10 * 1_000_000;

  const {
    zrc20,
    mockErc20,
    signers: [aliceSigner, bobSigner],
  } = await deploy({ mintAmount: TEN });

  expect(await mockErc20.balanceOf(aliceSigner.address)).to.eq(TEN);

  // Create approver
  const alice = await ShieldedAccount.create(zrc20, "password123");
  await alice.loginWithEthersSigner(aliceSigner);

  const bob = await ShieldedAccount.create(zrc20, "password123");
  await bob.loginWithEthersSigner(bobSigner);

  const prover = alice.getProver();

  // Create proof
  const shieldProof = await t("Creating shield proof", prover.shield(TEN));

  // call verify proof
  await t("Approving ERC20 payment", mockErc20.approve(zrc20.address, TEN));
  const tx = await t("Submitting transaction", zrc20.transact(shieldProof));
  await tx.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)
  const publicBalance = await t(
    "Getting ERC20 balance",
    mockErc20.balanceOf(aliceSigner.address)
  );

  expect(publicBalance).to.eq(0);
  const privateBalance = await t("Getting private balance", alice.getBalance());
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)

  // transfer is half the deposit
  const FIVE = 5_000_000;

  // receiver has to send sender a public keypair
  const bobKeypair = bob.getKeypair();
  const bobPubkey = bobKeypair.address(); // contains only the public key
  const zrcTransferProof = await t(
    "Creating transfer proof",
    prover.transfer(FIVE, bobPubkey)
  );
  const tx2 = await t(
    "Submitting transaction",
    zrc20.transact(zrcTransferProof)
  );
  await tx2.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)

  const alicePrivateBal = await t(
    "Getting private balance",
    alice.getBalance()
  );

  const bobPrivateBal = await t("Getting private balance", bob.getBalance());

  expect(alicePrivateBal).to.eq(FIVE);
  expect(bobPrivateBal).to.eq(FIVE);
  console.log("Ok");
});
