import { BigNumber, BigNumberish } from "ethers";
import { Utxo, printIntArray } from "../utxo";
import { Keypair } from "../keypair";
import { fieldToString } from "../poseidon";
import { toFixedHex } from "../utils";
import { EncryptedDb } from "./db";

export class AccountStore {
  constructor(private readonly db: EncryptedDb) {}

  async setKeypair(signerAddress: string, keypair: Keypair) {
    await this.db.publicKeys.add(signerAddress, keypair.address());
    return await this.db.keypairs.add(signerAddress, keypair);
  }

  async getKeypair(signerAddress: string) {
    return await this.db.keypairs.get(signerAddress);
  }

  async setLatestBlock(blockheight: number) {
    await this.db.latestBlock.add("latestBlock", blockheight);
  }

  async addNullifier(nullifier: Uint8Array | string) {
    await this.db.nullifiers.add(`${nullifier}`, 1);
  }

  async addUtxo(utxo: Utxo) {
    await this.db.utxos.add(printIntArray(utxo.getCommitment()), utxo);
  }

  async isSpent(utxo: Utxo): Promise<boolean> {
    return !!(await this.db.nullifiers.get(
      toFixedHex(fieldToString(utxo.getNullifier()))
    ));
  }

  async getUnspentUtxos() {
    const all = await this.db.utxos.getAll();
    // filter by asset type
    // asset -> Utxo[]
    const unspent: Record<string, Utxo[]> = {};
    for (const utxo of all) {
      if (!(await this.isSpent(utxo))) {
        if (!unspent[utxo.asset.toString()]) {
          unspent[utxo.asset.toString()] = [];
        }
        unspent[utxo.asset.toString()].push(utxo);
      }
    }
    return unspent;
  }

  async getUtxosUpTo(
    amount: BigNumberish,
    asset: BigNumberish
  ): Promise<Utxo[]> {
    const allUnspent = await this.getUnspentUtxos();
    const unspent = allUnspent[BigNumber.from(asset).toString()];
    const results: Utxo[] = [];
    let total = BigNumber.from(0);
    for (const note of unspent) {
      // console.log(`total before:` + total.toString());
      total = total.add(note.amount);
      // console.log(`total after:` + total.toString());
      results.push(note);
      // console.log(results.length);
      if (total.gte(amount)) break;
    }
    if (total.lt(amount)) {
      throw new Error("INSUFFICIENT_BALANCE");
    }
    return results;
  }

  async getBalance(asset: BigNumberish): Promise<BigNumber> {
    const allUnspent = await this.getUnspentUtxos();
    const unspent = allUnspent[BigNumber.from(asset).toString()];
    if (!unspent) return BigNumber.from(0);

    return unspent.reduce((acc: BigNumber, utxo: Utxo) => {
      return acc.add(utxo.amount);
    }, BigNumber.from(0));
  }
}
