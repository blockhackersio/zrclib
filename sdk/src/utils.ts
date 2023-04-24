import * as crypto from "crypto";
import * as ff from "ffjavascript";
import { BigNumber, utils } from "ethers";
import { FIELD_SIZE } from "./constants";
import { EthEncryptedData } from "@metamask/eth-sig-util";
import { Utxo } from "./utxo";

function randomBN(nbytes = 31) {
  return BigNumber.from(crypto.randomBytes(nbytes));
}

interface Params {
  recipient: string;
  encryptedOutput1: string;
  extAmount: string;
  encryptedOutput2: string;
  tokenOut: string;
  amountOutMin: BigNumber;
  swapRecipient: string;
  swapRouter: string;
  swapData: string;
  transactData: string;
}

function getExtDataHash({
  recipient,
  extAmount,
  encryptedOutput1,
  encryptedOutput2,
  tokenOut,
  amountOutMin,
  swapRecipient,
  swapRouter,
  swapData,
  transactData
}: Params) {
  const abi = new utils.AbiCoder();

  const encodedData = abi.encode(
    [
      "tuple(address recipient,int256 extAmount,bytes encryptedOutput1,bytes encryptedOutput2,address tokenOut,uint256 amountOutMin,address swapRecipient,address swapRouter,bytes swapData,bytes transactData)",
    ],
    [
      {
        recipient: toFixedHex(recipient, 20),
        extAmount: toFixedHex(extAmount),
        encryptedOutput1: encryptedOutput1,
        encryptedOutput2: encryptedOutput2,
        tokenOut: toFixedHex(tokenOut, 20),
        amountOutMin: toFixedHex(amountOutMin),
        swapRecipient: toFixedHex(swapRecipient, 20),
        swapRouter: toFixedHex(swapRouter, 20),
        swapData: toFixedHex(swapData),
        transactData: toFixedHex(transactData),
      },
    ]
  );
  const hash = utils.keccak256(encodedData);
  return BigNumber.from(hash).mod(FIELD_SIZE);
}

function toFixedHex(
  number?: number | Buffer | BigNumber | string | bigint | Uint8Array,
  length = 32
) {
  let result =
    "0x" +
    (number instanceof Buffer || number instanceof Uint8Array
      ? number.toString("hex")
      : BigNumber.from(number).toHexString().replace("0x", "")
    ).padStart(length * 2, "0");
  if (result.indexOf("-") > -1) {
    result = "-" + result.replace("-", "");
  }
  return result;
}

function toBuffer(value: string | number | BigNumber, length: number) {
  return Buffer.from(
    BigNumber.from(value)
      .toHexString()
      .slice(2)
      .padStart(length * 2, "0"),
    "hex"
  );
}

function shuffle(array: Utxo[]) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function packEncryptedMessage(encryptedData: EthEncryptedData) {
  const nonceBuf = Buffer.from(encryptedData.nonce, "base64");
  const ephemPublicKeyBuf = Buffer.from(encryptedData.ephemPublicKey, "base64");
  const ciphertextBuf = Buffer.from(encryptedData.ciphertext, "base64");
  const messageBuff = Buffer.concat([
    Buffer.alloc(24 - nonceBuf.length),
    nonceBuf,
    Buffer.alloc(32 - ephemPublicKeyBuf.length),
    ephemPublicKeyBuf,
    ciphertextBuf,
  ]);

  return "0x" + messageBuff.toString("hex");
}

export function unpackEncryptedMessage(encryptedMessage: string) {
  if (encryptedMessage.slice(0, 2) === "0x") {
    encryptedMessage = encryptedMessage.slice(2);
  }

  const messageBuff = Buffer.from(encryptedMessage, "hex");
  const nonceBuf = messageBuff.slice(0, 24);
  const ephemPublicKeyBuf = messageBuff.slice(24, 56);
  const ciphertextBuf = messageBuff.slice(56);

  return {
    version: "x25519-xsalsa20-poly1305",
    nonce: nonceBuf.toString("base64"),
    ephemPublicKey: ephemPublicKeyBuf.toString("base64"),
    ciphertext: ciphertextBuf.toString("base64"),
  };
}

export function stringifyBigInts<T>(input: T): T {
  return ff.utils.stringifyBigInts(input) as T;
}

export { randomBN, toFixedHex, toBuffer, getExtDataHash, shuffle };
