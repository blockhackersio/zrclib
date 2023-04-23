import { BigNumber, ethers, providers } from "ethers";
import { Utxo } from "./utxo";
import { UtxoEventDecryptor } from "./utxo_event_decryptor";
import { Keypair } from "./keypair";
import { PasswordEncryptor } from "./password_encryptor";
import { AccountStore } from "./account_store";

export class EventStoreWriter {
  constructor(
    contract: ethers.Contract,
    keypair: Keypair,
    storeKey: PasswordEncryptor,
    private _store: AccountStore = new AccountStore(storeKey),
    private utxoEventDecryptor: UtxoEventDecryptor = new UtxoEventDecryptor(
      contract,
      keypair
    )
  ) {
    this.utxoEventDecryptor.onUtxo(async (utxo, blockheight) => {
      await this._store.setLatestBlock(blockheight);
      await this._store.addUtxo(utxo);
    });

    this.utxoEventDecryptor.onNullifier(async (nullifier, blockheight) => {
      await this._store.setLatestBlock(blockheight);
      await this._store.addNullifier(nullifier);
    });
  }

  async start() {
    this.utxoEventDecryptor.start();
  }

  store() {
    return this._store;
  }

  async getUnspentUtxos() {
    return this._store.getUnspentUtxos();
  }

  async getUtxosUpTo(amount: number | BigNumber, asset: number | BigNumber): Promise<Utxo[]> {
    return this._store.getUtxosUpTo(amount, asset);
  }
}
