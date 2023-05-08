// Need this or ethers fails in node

import { ethers } from "hardhat";
import { EventMock__factory } from "../typechain-types";
import { Keypair, UtxoEventDecryptor, toFixedHex } from "@zrclib/sdk";
import { sleep } from "../utils";
import { expect } from "chai";
import { Utxo } from "@zrclib/sdk/src/utxo";
import { BigNumber } from "ethers";

it("UtxoEventDecryptor", async () => {
  const [deployer] = await ethers.getSigners();

  const factory = new EventMock__factory(deployer);
  const contract = await factory.deploy();
  const kp = await Keypair.generate();
  const decryptor = new UtxoEventDecryptor(contract, kp);

  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];
  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  await decryptor.start();

  // gets events after started
  let tx;
  console.log("Sending new nullifier...0x12345678");
  tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();
  await sleep(5000);
  console.log("Sending new nullifier...0x87654321");
  tx = await contract.newNullifier(toFixedHex("0x87654321"));
  await tx.wait();

  await sleep(10000);

  expect(nullifiers).to.eql([
    "0x0000000000000000000000000000000000000000000000000000000012345678",
    "0x0000000000000000000000000000000000000000000000000000000087654321",
  ]);
  decryptor.stop();
});

it("gets events before started", async () => {
  const [deployer] = await ethers.getSigners();

  const factory = new EventMock__factory(deployer);
  const contract = await factory.deploy();
  const kp = await Keypair.generate();
  const decryptor = new UtxoEventDecryptor(contract, kp);

  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];
  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  // gets events before started
  let tx;
  tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();
  tx = await contract.newNullifier(toFixedHex("0x87654321"));
  await tx.wait();

  await sleep(15000);
  await decryptor.start();
  await sleep(2000);

  expect(nullifiers).to.eql([
    "0x0000000000000000000000000000000000000000000000000000000012345678",
    "0x0000000000000000000000000000000000000000000000000000000087654321",
  ]);

  decryptor.stop();
});

it("allows events that include identical events", async () => {
  const [deployer] = await ethers.getSigners();

  const factory = new EventMock__factory(deployer);
  const contract = await factory.deploy();
  const kp = await Keypair.generate();
  const decryptor = new UtxoEventDecryptor(contract, kp);

  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];
  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  // gets events before started
  let tx;
  tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();
  tx = await contract.newNullifier(toFixedHex("0x12345678"));
  await tx.wait();

  await sleep(15000);
  await decryptor.start();
  await sleep(2000);

  expect(nullifiers).to.eql([
    "0x0000000000000000000000000000000000000000000000000000000012345678",
    "0x0000000000000000000000000000000000000000000000000000000012345678",
  ]);

  decryptor.stop();
});

it("gets comitment before started", async () => {
  const [deployer] = await ethers.getSigners();

  const factory = new EventMock__factory(deployer);
  const contract = await factory.deploy();
  const kp = await Keypair.generate();
  const decryptor = new UtxoEventDecryptor(contract, kp);

  let nullifiers: string[] = [];
  let utxos: Utxo[] = [];
  decryptor.onNullifier((n) => {
    nullifiers.push(n);
  });

  decryptor.onUtxo((n) => {
    utxos.push(n);
  });

  const u1 = new Utxo({ amount: 10, keypair: kp });
  const u2 = new Utxo({ amount: 20, keypair: kp });

  // gets events before started
  let tx;
  tx = await contract.newCommitment(
    toFixedHex(toFixedHex(Buffer.from(u1.getCommitment()))),
    toFixedHex(u1.index ?? 0),
    u1.encrypt()
  );
  await tx.wait();
  tx = await contract.newCommitment(
    toFixedHex(toFixedHex(Buffer.from(u2.getCommitment()))),
    toFixedHex(u2.index ?? 0),
    u2.encrypt()
  );
  await tx.wait();

  await sleep(15000);
  await decryptor.start();
  await sleep(2000);

  expect(utxos.map((u) => u.amount)).to.eql([
    BigNumber.from(10),
    BigNumber.from(20),
  ]);

  decryptor.stop();
});
