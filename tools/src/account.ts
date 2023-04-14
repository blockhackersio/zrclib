import { UtxoStore } from ".";
import { Keypair } from "./keypair";

export class Account {
  constructor(
    private keypair: Keypair,
    private utxoStore: UtxoStore = UtxoStore.create()
  ) {}

  getKeypair() {
    return this.keypair;
  }

  async getUtxosUpTo(amount: number) {
    return await this.utxoStore.getUtxosUpTo(amount);
  }

  fromKeypair(keypair: Keypair) {
    return new Account(keypair);
  }
}
