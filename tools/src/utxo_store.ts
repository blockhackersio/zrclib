import { Utxo } from "./utxo";

// TBD
export class UtxoStore {
  async getUtxosUpTo(_amount: number): Promise<Utxo[]> {
    return [];
  }

  static create() {
    return new UtxoStore();
  }
}
