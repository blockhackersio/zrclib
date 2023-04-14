import crypto from "crypto";
import ff from "ffjavascript";
import { BigNumber, utils } from "ethers";
import { numbers, FIELD_SIZE } from "./constants";
import { BaseUtxo } from "./types";
import { EthEncryptedData } from "eth-sig-util";

const BYTES_31 = 31;
const BYTES_32 = 32;
const ADDRESS_BYTES_LENGTH = 20;

function randomBN(nbytes = BYTES_31) {
  return BigNumber.from(crypto.randomBytes(nbytes));
}

interface Params {
  recipient: string; // address || 0
  // relayer: string; // address || 0
  encryptedOutput1: string;
  extAmount: string;
  // fee: string;
  // l1Fee: string;
  // isL1Withdrawal: boolean;
  encryptedOutput2: string;
}

function getExtDataHash({
  recipient,
  extAmount,
  // isL1Withdrawal,
  // relayer,
  // fee,
  // l1Fee,
  encryptedOutput1,
  encryptedOutput2,
}: Params) {
  const abi = new utils.AbiCoder();

  const encodedData = abi.encode(
    [
      "tuple(address recipient,int256 extAmount,bytes encryptedOutput1,bytes encryptedOutput2)",
    ],
    [
      {
        recipient: toFixedHex(recipient, ADDRESS_BYTES_LENGTH),
        extAmount: toFixedHex(extAmount),
        encryptedOutput1: encryptedOutput1,
        encryptedOutput2: encryptedOutput2,
      },
    ]
  );
  const hash = utils.keccak256(encodedData);
  return BigNumber.from(hash).mod(FIELD_SIZE).toBigInt();
}

function toFixedHex(
  number?: number | Buffer | BigNumber | string,
  length = BYTES_32
) {
  let result =
    "0x" +
    (number instanceof Buffer
      ? number.toString("hex")
      : BigNumber.from(number).toHexString().replace("0x", "")
    ).padStart(length * numbers.TWO, "0");
  if (result.includes("-")) {
    result = "-" + result.replace("-", "");
  }
  return result;
}

function toBuffer(value: string | number | BigNumber, length: number) {
  const number = BigNumber.from(value)
    .toHexString()
    .slice(numbers.TWO)
    .padStart(length * numbers.TWO, "0");

  return Buffer.from(number, "hex");
}

function shuffle(array: BaseUtxo[]) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== numbers.ZERO) {
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

const NONCE_BUF_LENGTH = 24;
const EPHEM_PUBLIC_KEY_BUF_LENGTH = 56;

export function packEncryptedMessage(encryptedData: EthEncryptedData) {
  const nonceBuf = Buffer.from(encryptedData.nonce, "base64");
  const ephemPublicKeyBuf = Buffer.from(encryptedData.ephemPublicKey, "base64");
  const ciphertextBuf = Buffer.from(encryptedData.ciphertext, "base64");

  const messageBuff = Buffer.concat([
    Buffer.alloc(NONCE_BUF_LENGTH - nonceBuf.length),
    nonceBuf,
    Buffer.alloc(BYTES_32 - ephemPublicKeyBuf.length),
    ephemPublicKeyBuf,
    ciphertextBuf,
  ]);

  return "0x" + messageBuff.toString("hex");
}

export function unpackEncryptedMessage(encryptedMessage: string) {
  if (encryptedMessage.slice(numbers.ZERO, numbers.OX_LENGTH) === "0x") {
    encryptedMessage = encryptedMessage.slice(numbers.OX_LENGTH);
  }

  const messageBuff = Buffer.from(encryptedMessage, "hex");
  const nonceBuf = messageBuff.slice(numbers.ZERO, NONCE_BUF_LENGTH);
  const ephemPublicKeyBuf = messageBuff.slice(
    NONCE_BUF_LENGTH,
    EPHEM_PUBLIC_KEY_BUF_LENGTH
  );
  const ciphertextBuf = messageBuff.slice(EPHEM_PUBLIC_KEY_BUF_LENGTH);

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
