// Need this or ethers fails in node

import { ethers } from "hardhat";
import { EventMock__factory } from "../typechain-types";
import { Keypair, UtxoEventDecryptor, toFixedHex } from "@zrclib/sdk";
import { expect } from "chai";
import { Utxo } from "@zrclib/sdk/src/utxo";
import { BigNumber } from "ethers";
import { sleep, waitUntil } from "../utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployContract() {
  const [deployer] = await ethers.getSigners();

  const factory = new EventMock__factory(deployer);
  const contract = await factory.deploy();
  const kp = await Keypair.generate();
  const decryptor = new UtxoEventDecryptor(contract, kp);

  return { decryptor, kp, contract };
}

it.skip("UtxoEventDecryptor", async () => {
  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];

  const { contract, decryptor } = await loadFixture(deployContract);

  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  await decryptor.start();

  // gets events after started
  console.log("Sending new nullifier...0x12345678");
  let tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();

  await sleep(1000);

  console.log("Sending new nullifier...0x87654321");
  tx = await contract.newNullifier(toFixedHex("0x87654321"));
  await tx.wait();

  await waitUntil(
    async () => nullifiers.length,
    (l) => l === 2
  );

  expect(nullifiers).to.eql([
    "0x0000000000000000000000000000000000000000000000000000000012345678",
    "0x0000000000000000000000000000000000000000000000000000000087654321",
  ]);

  await decryptor.stop();
});

it.skip("gets events before started", async () => {
  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];
  const { contract, decryptor } = await loadFixture(deployContract);

  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  // gets events before started
  console.log("Sending new nullifier...0x12345678");
  let tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();

  await sleep(1000);

  console.log("Sending new nullifier...0x87654321");
  tx = await contract.newNullifier(toFixedHex("0x87654321"));
  await tx.wait();

  await decryptor.start();

  await waitUntil(
    async () => nullifiers.length,
    (l) => l === 2
  );

  expect(nullifiers).to.eql([
    "0x0000000000000000000000000000000000000000000000000000000012345678",
    "0x0000000000000000000000000000000000000000000000000000000087654321",
  ]);

  await decryptor.stop();
});

it.skip("allows events that include identical events", async () => {
  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];

  const { contract, decryptor } = await loadFixture(deployContract);

  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  // gets events before started
  console.log("Sending new nullifier...0x12345678");
  let tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();

  await sleep(1000);

  console.log("Sending new nullifier...0x12345678");
  tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();

  await decryptor.start();
  await decryptor.waitForAllHandlers();
  await waitUntil(
    async () => nullifiers.length,
    (l) => l === 2
  );
  expect(nullifiers).to.eql([
    "0x0000000000000000000000000000000000000000000000000000000012345678",
    "0x0000000000000000000000000000000000000000000000000000000012345678",
  ]);

  await decryptor.stop();
});

it.skip("gets comitment before started", async () => {
  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];

  const { contract, decryptor, kp } = await loadFixture(deployContract);

  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  const u1 = new Utxo({ amount: 10, keypair: kp });
  const u2 = new Utxo({ amount: 20, keypair: kp });

  // gets events before started

  await expect(
    contract.newCommitment(
      toFixedHex(toFixedHex(Buffer.from(u1.getCommitment()))),
      toFixedHex(u1.index ?? 0),
      u1.encrypt()
    )
  ).to.emit(contract, "NewCommitment");

  await sleep(1000);

  await expect(
    contract.newCommitment(
      toFixedHex(toFixedHex(Buffer.from(u2.getCommitment()))),
      toFixedHex(u2.index ?? 0),
      u2.encrypt()
    )
  ).to.emit(contract, "NewCommitment");

  await decryptor.start();

  await waitUntil(
    async () => utxos.length,
    (l) => l === 2
  );

  expect(utxos.map((u) => u.amount)).to.eql([
    BigNumber.from(10),
    BigNumber.from(20),
  ]);

  await decryptor.stop();
});
