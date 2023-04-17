import {
  createEventStream,
  filterNullifiers,
  filterValidEncryptedUtxosAndDecrypt,
} from "./events";
import { Keypair } from "./keypair";
import { ContractEvent, Store } from "./types";
import { Observable, share } from "rxjs";
import { Utxo } from "./utxo";

export class EventIngestor {
  constructor(
    private _utxoStore: Store<Utxo>,
    private _nullifierStore: Store<string>,
    private _contractEventStream: Observable<ContractEvent>,
    private _keypair: Keypair
  ) {}

  async connect() {
    const event$ = this._contractEventStream.pipe(share());
    const utxo$ = event$.pipe(
      filterValidEncryptedUtxosAndDecrypt(this._keypair)
    );
    const nullifier$ = event$.pipe(filterNullifiers());
    const utxoStore = this._utxoStore;
    const nullifierStore = this._nullifierStore;
    utxo$.subscribe(async (data) => {
      console.log({ utxo$: data });
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
