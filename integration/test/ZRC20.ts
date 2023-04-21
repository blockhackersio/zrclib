// Need this or ethers fails in node

import { ethers } from "hardhat";
import { ShieldedAccount } from "@zrclib/tools";

import path from "path";
import { Verifier__factory, ZRC20__factory } from "../typechain-types";
import { expect } from "chai";
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
async function t<T>(
  log: string,
  promiseOrFn: Promise<T> | (() => Promise<T>)
): Promise<T> {
  const prom = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
  const started = Date.now();
  console.log(`${log}... `);
  const result = await prom;
  console.log(`${Date.now() - started}ms`);
  return result;
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

  const alice = await ShieldedAccount.create(zrc20, "password123");
  await alice.loginWithEthersSigner(aliceSigner);

  const bob = await ShieldedAccount.create(zrc20, "password123");
  await bob.loginWithEthersSigner(bobSigner);

  zrc20 = zrc20.connect(deployer);

  await (await zrc20.mint(aliceSigner.address, TEN)).wait();

  const aliceProver = alice.getProver();
  zrc20 = zrc20.connect(aliceSigner);

  // Create proof
  const shieldProof = await t(
    "1. Creating shield proof",
    aliceProver.shield(TEN)
  );

  // call verify proof
  await (
    await t("2. Approving ERC20 payment", zrc20.approve(zrc20.address, TEN))
  ).wait();
  const tx = await t("3. Submitting transaction", zrc20.transact(shieldProof));
  await tx.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)
  const publicBalance = await t(
    "4. Getting ERC20 balance",
    zrc20.balanceOf(aliceSigner.address)
  );

  expect(publicBalance).to.eq(0);
  const privateBalance = await t(
    "5. Getting private balance",
    alice.getBalance()
  );
  expect(privateBalance).to.eq(TEN); // Transfer to the darkside worked! :)

  // receiver has to send sender a public keypair
  const bobKeypair = bob.getKeypair();
  const bobPubkey = bobKeypair.address(); // contains only the public key
  const zrcTransferProof = await t(
    "6. Creating transfer proof",
    aliceProver.transfer(FIVE, bobPubkey)
  );
  const tx2 = await t(
    "7. Submitting transaction",
    zrc20.transact(zrcTransferProof)
  );
  await tx2.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)

  const alicePrivateBal = await t(
    "8. Getting private balance",
    alice.getBalance()
  );

  const bobPrivateBal = await t("9. Getting private balance", bob.getBalance());

  expect(alicePrivateBal).to.eq(FIVE);
  expect(bobPrivateBal).to.eq(FIVE);

  const withdrawProof = await t(
    "10. Creating withdraw proof",
    aliceProver.unshield(FIVE, aliceSigner.address)
  );
  const tx3 = await t(
    "11. Submitting transaction",
    zrc20.transact(withdrawProof)
  );
  await tx3.wait();
  await sleep(10_000); // Must wait for events to fire after pool (cannot seem to speed up polling)
  const publicBalance2 = await t(
    "12. Getting ERC20 balance",
    zrc20.balanceOf(aliceSigner.address)
  );

  expect(publicBalance2).to.eq(FIVE);

  console.log("Ok");
});
