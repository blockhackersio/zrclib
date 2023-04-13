import { BigNumber } from "ethers";

import { numbers, BG_ZERO } from "./constants";
import { UtxoStatic, BaseUtxo, BaseKeypair, UtxoOptions } from "./types";

import { Keypair } from "./keypair";
import { randomBN, poseidonHash, toBuffer } from "./utils";

const BYTES_31 = 31;
const BYTES_62 = 62;

class Utxo extends UtxoStatic implements BaseUtxo {
  public keypair: BaseKeypair;
  public amount: BigNumber;
  public transactionHash?: string;
  public blinding: BigNumber;
  public index: number;
  public commitment?: BigNumber;
  public nullifier?: BigNumber;

  public static decrypt(
    keypair: BaseKeypair,
    data: string,
    index: number
  ): BaseUtxo {
    const buf = keypair.decrypt(data);

    return new Utxo({
      amount: BigNumber.from(
        "0x" + buf.slice(numbers.ZERO, BYTES_31).toString("hex")
      ),
      blinding: BigNumber.from(
        "0x" + buf.slice(BYTES_31, BYTES_62).toString("hex")
      ),
      keypair,
      index,
    });
  }

  public constructor({
    amount = BG_ZERO,
    keypair = new Keypair(),
    blinding = randomBN(),
    index = numbers.ZERO,
  }: UtxoOptions = {}) {
    super();

    this.amount = BigNumber.from(amount);
    this.blinding = BigNumber.from(blinding);
    this.keypair = keypair;
    this.index = index;
  }

  public getCommitment() {
    if (this.commitment == null) {
      this.commitment = poseidonHash([
        this.amount,
        this.keypair.pubkey,
        this.blinding,
      ]);
    }
    return this.commitment;
  }

  public getNullifier() {
    if (this.nullifier == null) {
      // eslint-disable-next-line eqeqeq
      if (
        this.amount.gt(numbers.ZERO) &&
        (this.index == undefined || this.keypair.privkey == undefined)
      ) {
        throw new Error(
          "Can not compute nullifier without utxo index or shielded key"
        );
      }
      const signature = this.keypair.privkey
        ? this.keypair.sign(this.getCommitment(), this.index || numbers.ZERO)
        : numbers.ZERO;
      this.nullifier = poseidonHash([
        this.getCommitment(),
        this.index || numbers.ZERO,
        signature,
      ]);
    }
    return this.nullifier;
  }

  public encrypt() {
    const bytes = Buffer.concat([
      toBuffer(this.amount, BYTES_31),
      toBuffer(this.blinding, BYTES_31),
    ]);
    return this.keypair.encrypt(bytes);
  }
}

export { Utxo };
