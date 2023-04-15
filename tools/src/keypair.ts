import { BigNumber, Wallet, BigNumberish } from "ethers";
import { encrypt, decrypt, getEncryptionPublicKey } from "eth-sig-util";

import { packEncryptedMessage, unpackEncryptedMessage } from "./utils";

import { toFixedHex } from "./utils";
import { ensurePoseidon, poseidonHash } from "./poseidon";

class Keypair {
  public privkey: string;
  public pubkey: BigNumber;
  public encryptionKey: string;

  public constructor(privkey = Wallet.createRandom().privateKey) {
    this.privkey = privkey;
    this.pubkey = poseidonHash([privkey]);
    this.encryptionKey = getEncryptionPublicKey(privkey.slice(2));
  }

  public toString() {
    return (
      toFixedHex(this.pubkey) +
      Buffer.from(this.encryptionKey, "base64").toString("hex")
    );
  }

  public address() {
    return this.toString();
  }

  public encrypt(bytes: Buffer) {
    return packEncryptedMessage(
      encrypt(
        this.encryptionKey,
        { data: bytes.toString("base64") },
        "x25519-xsalsa20-poly1305"
      )
    );
  }

  public decrypt(data: string) {
    return Buffer.from(
      decrypt(unpackEncryptedMessage(data), this.privkey.slice(2)),
      "base64"
    );
  }

  public sign(
    commitment: string | number | BigNumber,
    merklePath: string | number | BigNumber
  ): BigNumber {
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
      pubkey: BigNumber.from("0x" + str.slice(0, 64)),
      encryptionKey: Buffer.from(str.slice(64, 128), "hex").toString("base64"),
    });
  }

  public static async generate() {
    await ensurePoseidon();
    return new Keypair();
  }
}

export { Keypair };
