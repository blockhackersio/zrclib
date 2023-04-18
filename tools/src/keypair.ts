import { BigNumber, Wallet, ethers } from "ethers";
import { packEncryptedMessage, unpackEncryptedMessage } from "./utils";
import { toFixedHex } from "./utils";
import { ensurePoseidon, poseidonHash } from "./poseidon";
import {
  entropyToMnemonic,
  hashMessage,
  keccak256,
  recoverAddress,
} from "ethers/lib/utils";
import { SignatureLike, hexDataSlice } from "@ethersproject/bytes";
import {
  decrypt,
  encrypt,
  getEncryptionPublicKey,
} from "@metamask/eth-sig-util";

class Keypair {
  public privkey: string;
  public pubkey: Uint8Array;
  public encryptionKey: string;

  public constructor(privkey = Wallet.createRandom().privateKey) {
    this.privkey = toFixedHex(privkey);
    this.pubkey = poseidonHash([privkey]);
    this.encryptionKey = getEncryptionPublicKey(privkey.slice(2));
  }

  public toString() {
    return (
      toFixedHex(Buffer.from(this.pubkey)) +
      Buffer.from(this.encryptionKey, "base64").toString("hex")
    );
  }

  public address() {
    return this.toString();
  }

  public encrypt(bytes: Buffer) {
    const d = encrypt({
      publicKey: this.encryptionKey,
      data: bytes.toString("base64"),
      version: "x25519-xsalsa20-poly1305",
    });
    return packEncryptedMessage(d);
  }

  public decrypt(data: string) {
    return Buffer.from(
      decrypt({
        encryptedData: unpackEncryptedMessage(data),
        privateKey: this.privkey.slice(2),
      }),
      "base64"
    );
  }

  public sign(
    commitment: string | number | BigNumber | Uint8Array,
    merklePath: string | number | BigNumber | Uint8Array
  ): Uint8Array {
    return poseidonHash([this.privkey, commitment, merklePath]);
  }

  public static fromString(str: string) {
    if (str.length === 130) {
      str = str.slice(2);
    }

    if (str.length !== 128) {
      throw new Error("Invalid key length");
    }

    return Object.assign(new Keypair(), {
      privkey: null,
      pubkey: new Uint8Array(Buffer.from(str.slice(0, 64), "hex")),
      encryptionKey: Buffer.from(str.slice(64, 128), "hex").toString("base64"),
    }) as Keypair;
  }

  public static async generate() {
    await ensurePoseidon();
    return new Keypair();
  }

  public static async fromSigner(signer: ethers.Signer): Promise<Keypair> {
    await ensurePoseidon();
    const signedMessage = await signer.signMessage(LOGIN_MESSAGE);
    const addressFromSign = verifyMessage(LOGIN_MESSAGE, signedMessage);
    const signerAddress = await signer.getAddress();
    if (signerAddress !== addressFromSign) {
      throw new Error("INVALID_SIGNATURE");
    }
    const privKey = generatePrivateKeyFromEntropy(signedMessage);
    const keypair = new Keypair(privKey);
    console.log(`keypair: ${keypair.address()}`);
    return keypair;
  }
}

export { Keypair };

function verifyMessage(message: string, signature: SignatureLike): string {
  return recoverAddress(hashMessage(message), signature);
}

export function generatePrivateKeyFromEntropy(entropy: string) {
  const hexData = hexDataSlice(keccak256(entropy), 0, 16);

  const mnemonic = entropyToMnemonic(hexData);

  return Wallet.fromMnemonic(mnemonic).privateKey;
}

const LOGIN_MESSAGE = "LOG ME IN!";
