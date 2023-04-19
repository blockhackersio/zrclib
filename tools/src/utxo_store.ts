import { BigNumber } from "ethers";
import { Utxo } from "./utxo";
import { UtxoEventDecryptor } from "./utxo_event_decryptor";
import { Keypair } from "./keypair";
import { PasswordEncryptor } from "./password_encryptor";
import { EncryptedStore } from "./encrypted_store";
import { Store } from "./types";

export class UtxoStore {
  constructor(
    address: string,
    keypair: Keypair,
    storeKey: PasswordEncryptor,
    private utxoEventDecryptor: UtxoEventDecryptor = new UtxoEventDecryptor(
      address,
      keypair
    ),
    private store: Store<Utxo | string | number> = new EncryptedStore(storeKey)
  ) {
    this.utxoEventDecryptor.onUtxo(async (utxo, blockheight) => {
      await this.store.add("latestBlock", blockheight);
      await this.store.add(`${utxo.getCommitment()}`, utxo);
    });

    this.utxoEventDecryptor.onNullifier(async (nullifier, blockheight) => {
      await this.store.add("latestBlock", blockheight);
      await this.store.add(`${nullifier}`, 1);
    });
  }

  async start() {
    // get lastBlock from encrypted store
    this.utxoEventDecryptor.start();
  }

  async getUtxosUpTo(_amount: number | BigNumber): Promise<Utxo[]> {
    return [];
  }
}
