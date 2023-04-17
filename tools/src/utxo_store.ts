import { BigNumber } from "ethers";
import { Utxo } from "./utxo";

// TBD
export class UtxoStore {
  async getUtxosUpTo(_amount: number | BigNumber): Promise<Utxo[]> {
    return [];
  }

  static create() {
    return new UtxoStore();
  }
}
