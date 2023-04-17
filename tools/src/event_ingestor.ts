import { share } from "rxjs";
import {
  createEventStream,
  filterNullifiers,
  filterValidEncryptedUtxosAndDecrypt,
} from "./events";
import { Keypair } from "./keypair";
import { Store } from "./types";
import { Utxo } from "./utxo";

export class EventIngestor {
  constructor(
    private _utxoStore: Store<Utxo>,
    private _nullifierStore: Store<string>,
    private _address: string,
    private _keypair: Keypair
  ) {}

  async connect() {
    const stream = createEventStream(this._address).pipe(share());
    const utxo$ = stream.pipe(
      filterValidEncryptedUtxosAndDecrypt(this._keypair)
    );
    const nullifier$ = stream.pipe(filterNullifiers());
    const utxoStore = this._utxoStore;
    const nullifierStore = this._nullifierStore;
    utxo$.subscribe(async (data) => {
      await utxoStore.add(`${data.getCommitment()}`, data);
    });
    // TODO: Use a set instead of a Store
    nullifier$.subscribe(async (data) => {
      await nullifierStore.add(data.nullifier, "1");
    });
  }

  utxoStore() {
    return this._utxoStore;
  }

  nullifierStore() {
    return this._nullifierStore;
  }
}
