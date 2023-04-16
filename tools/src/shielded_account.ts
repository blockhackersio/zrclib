import { UtxoStore } from "./utxo_store";
import { Keypair } from "./keypair";

export class ShieldedAccount {
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

  async fromKeypair(keypair: Keypair) {
    return new ShieldedAccount(keypair);
  }
}
