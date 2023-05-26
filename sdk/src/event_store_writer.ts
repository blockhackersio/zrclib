import { BigNumber } from "ethers";
import { Utxo } from "./utxo";
import { UtxoEventDecryptor } from "./utxo_event_decryptor";
import { AccountStore } from "./store/account_store";

/**
 * Connect a contract with an account store and passing events to the account store
 */
export class EventStoreWriter {
  constructor(
    private store: AccountStore,
    private utxoEventDecryptor: UtxoEventDecryptor
  ) {
    this.utxoEventDecryptor.onUtxo(async (utxo, blockheight) => {
      console.log("onUtxo()");
      await this.store.setLatestBlock(blockheight);
      await this.store.addUtxo(utxo);
    });

    this.utxoEventDecryptor.onNullifier(async (nullifier, blockheight) => {
      console.log("onNullifier", nullifier);
      await this.store.setLatestBlock(blockheight);
      await this.store.addNullifier(nullifier);
    });
  }

  async start() {
    this.utxoEventDecryptor.start();
  }

  async stop() {
    await this.utxoEventDecryptor.stop();
  }

  async getUnspentUtxos() {
    return this.store.getUnspentUtxos();
  }

  async getUtxosUpTo(
    amount: number | BigNumber,
    asset: number | BigNumber
  ): Promise<Utxo[]> {
    return this.store.getUtxosUpTo(amount, asset);
  }
}
