import { BigNumber, BigNumberish } from "ethers";
import { EncryptedStore } from "./encrypted_store";
import { InMemoryStore } from "./in_memory_store";
import { PasswordEncryptor } from "./password_encryptor";
import { Store } from "./types";
import { Utxo, UtxoSerializer } from "./utxo";
import { Keypair, KeypairSerializer } from "./keypair";
import { fieldToString } from "./poseidon";
import { toFixedHex } from "./utils";

export class AccountStore {
  constructor(
    storeKey: PasswordEncryptor,
    private utxoStore: Store<Utxo> = new EncryptedStore(
      storeKey,
      new UtxoSerializer()
    ),
    private keypairStore: Store<Keypair> = new EncryptedStore(
      storeKey,
      new KeypairSerializer()
    ),
    private nullifierStore: Store<Utxo | string | number> = new InMemoryStore(),
    private latestBlock: Store<Utxo | string | number> = new InMemoryStore()
  ) {}

  async setKeypair(keypair: Keypair) {
    return await this.keypairStore.add("0x5d32781", keypair);
  }

  async getKeypair() {
    return await this.keypairStore.get("0x5d32781");
  }

  async setLatestBlock(blockheight: number) {
    await this.latestBlock.add("latestBlock", blockheight);
  }

  async addNullifier(nullifier: Uint8Array | string) {
    await this.nullifierStore.add(`${nullifier}`, 1);
  }

  async addUtxo(utxo: Utxo) {
    await this.utxoStore.add(`${utxo.getCommitment()}`, utxo);
  }

  async isSpent(utxo: Utxo): Promise<boolean> {
    return !!(await this.nullifierStore.get(
      toFixedHex(fieldToString(utxo.getNullifier()))
    ));
  }

  async getUnspentUtxos() {
    const all = await this.utxoStore.getAll();
    // filter by asset type
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

  async getUtxosUpTo(amount: BigNumberish, asset: BigNumberish): Promise<Utxo[]> {
    const allUnspent = await this.getUnspentUtxos();
    const unspent = allUnspent[asset.toString()];
    const results: Utxo[] = [];
    let total = BigNumber.from(0);
    for (const note of unspent) {
      total = total.add(note.amount);
      results.push(note);
      if (total.gte(amount)) break;
    }
    if (total.lt(amount)) {
      throw new Error("INSUFFICIENT_BALANCE");
    }
    return results;
  }

  async getBalance(asset: BigNumberish): Promise<BigNumber> {
    const allUnspent = await this.getUnspentUtxos();
    const unspent = allUnspent[asset.toString()];
    if (!unspent) return BigNumber.from(0);

    return unspent.reduce((acc: BigNumber, utxo: Utxo) => {
      return acc.add(utxo.amount);
    }, BigNumber.from(0));
  }
}
