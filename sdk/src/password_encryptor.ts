// encrypt.ts

import { Buffer } from "buffer";

declare const window: any;

export interface CryptoKeyPair {
  key: CryptoKey;
  privateKey?: CryptoKey;
  publicKey?: CryptoKey;
}

const isBrowser =
  typeof window !== "undefined" && typeof window.crypto !== "undefined";
const crypto: Crypto = isBrowser ? window.crypto : require("crypto").webcrypto;

export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  try {
    const dataString = data;
    const dataBuffer = isBrowser
      ? new TextEncoder().encode(dataString)
      : Buffer.from(dataString, "utf-8");

    const iv = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-CTR",
        counter: iv,
        length: 64,
      },
      key,
      dataBuffer
    );

    const encryptedArray = isBrowser
      ? new Uint8Array(encryptedBuffer)
      : Buffer.from(encryptedBuffer);

    const resultBuffer = new Uint8Array(16 + encryptedArray.length);
    resultBuffer.set(iv, 0);
    resultBuffer.set(encryptedArray, 16);

    return Buffer.from(resultBuffer).toString("hex");
  } catch (err) {
    throw new Error("ENCRYPTION_FAILURE");
  }
}

export async function decrypt(
  hexString: string,
  key: CryptoKey
): Promise<string> {
  try {
    const encryptedBuffer = Buffer.from(hexString, "hex");
    const iv = encryptedBuffer.slice(0, 16);
    const dataBuffer = encryptedBuffer.slice(16);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CTR",
        counter: iv,
        length: 64,
      },
      key,
      dataBuffer
    );

    const decryptedString = isBrowser
      ? new TextDecoder().decode(new Uint8Array(decryptedBuffer))
      : Buffer.from(decryptedBuffer).toString("utf-8");

    return decryptedString;
  } catch (err) {
    throw new Error("DECRYPTION_FAILURE");
  }
}

function strencode(input: string): Uint8Array {
  return isBrowser
    ? new TextEncoder().encode(input)
    : new Uint8Array(Buffer.from(input, "utf-8"));
}

export async function generateKeyFromPassword(
  password: string,
  iterations: number = 10000
): Promise<CryptoKey> {
  const passwordBuffer = strencode(password);

  const importAlgorithm = {
    name: "PBKDF2",
  };

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    importAlgorithm,
    false,
    ["deriveBits", "deriveKey"]
  );

  const deriveAlgorithm = {
    name: "PBKDF2",
    salt: strencode(
      "I am determined to be half a password" + password.slice(0, 5)
    ),
    iterations,
    hash: "SHA-256",
  };

  return await crypto.subtle.deriveKey(
    deriveAlgorithm,
    keyMaterial,
    { name: "AES-CTR", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export class PasswordEncryptor {
  private _keyProm: Promise<CryptoKey>;
  constructor(password: string) {
    this._keyProm = generateKeyFromPassword(password);
  }
  async encrypt(data: string): Promise<string> {
    const key = await this._keyProm;
    return encrypt(data, key);
  }

  async decrypt(data: string): Promise<string> {
    const key = await this._keyProm;
    return decrypt(data, key) as Promise<string>;
  }

  public static fromPassword(password: string) {
    return new PasswordEncryptor(password);
  }
}
