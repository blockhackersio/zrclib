import { BigNumber, BigNumberish } from "ethers";
import { UtxoOptions } from "./types";
import { Keypair } from "./keypair";
import { randomBN, toBuffer } from "./utils";
import { poseidonHash } from "./poseidon";
import { Serializer } from "./serializer";

export class Utxo {
  public keypair: Keypair;
  public amount: BigNumber;
  public asset: BigNumber;
  public transactionHash?: string;
  public blinding: BigNumber;
  public index: number | null;
  public commitment?: Uint8Array;
  public nullifier?: Uint8Array;

  public static decrypt(keypair: Keypair, data: string, index: number): Utxo {
    const buf = keypair.decrypt(data);

    return new Utxo({
      amount: BigNumber.from("0x" + buf.slice(0, 31).toString("hex")),
      blinding: BigNumber.from("0x" + buf.slice(31, 62).toString("hex")),
      keypair,
      index,
    });
  }

  public constructor({
    asset = 0,
    amount = 0,
    keypair = new Keypair(),
    blinding = randomBN(),
    index = null,
  }: UtxoOptions = {}) {
    this.asset = BigNumber.from(asset);
    this.amount = BigNumber.from(amount);
    this.blinding = BigNumber.from(blinding);
    this.keypair = keypair;
    this.index = index;
  }

  public getCommitment() {
    if (!this.commitment) {
      this.commitment = poseidonHash([
        this.amount,
        this.keypair.pubkey,
        this.blinding,
        this.asset
      ]);
    }
    return this.commitment;
  }

  public getNullifier() {
    if (!this.nullifier) {
      if (
        this.amount.gt(0) &&
        (this.index === null ||
          this.index === undefined ||
          this.keypair.privkey === undefined ||
          this.keypair.privkey === null)
      ) {
        throw new Error(
          "Can not compute nullifier without utxo index or shielded key"
        );
      }

      const commitment = this.getCommitment()!;
      const signature = this.keypair?.privkey
        ? this.keypair.sign(commitment, this.index || 0)
        : 0;
      this.nullifier = poseidonHash([commitment, this.index || 0, signature]);
    }
    return this.nullifier;
  }

  public encrypt() {
    if (!this.keypair) throw new Error("Cannot encrypt without keypair");
    const bytes = Buffer.concat([
      toBuffer(this.amount, 31),
      toBuffer(this.blinding, 31),
    ]);
    return this.keypair.encrypt(bytes);
  }
}
export class UtxoSerializer implements Serializer<Utxo> {
  serialize(o: Utxo): string {
    const { amount, blinding, keypair, index } = o;

    return JSON.stringify({
      amount,
      blinding,
      keypair: keypair.privkey,
      index,
    });
  }

  deserialize(o: string): Utxo {
    const { amount, blinding, keypair, index } = JSON.parse(o);
    return new Utxo({
      amount: BigNumber.from(amount),
      blinding: BigNumber.from(blinding),
      keypair: new Keypair(keypair),
      index,
    });
  }
}
