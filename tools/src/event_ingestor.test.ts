import { BigNumber } from "ethers";
import { EventIngestor } from "./event_ingestor";
import { InMemoryStore } from "./in_memory_store";
import { Keypair } from "./keypair";
import { ContractEvent } from "./types";
import { Utxo } from "./utxo";
import { toFixedHex } from "./utils";
import { Subject, share } from "rxjs";
import { fieldToObject } from "./poseidon";

test("EventIngestor", async () => {
  const utxoStore = new InMemoryStore<Utxo>();
  const nullifierStore = new InMemoryStore<string>();
  const mykeypair = await Keypair.generate();
  const yourkeypair = await Keypair.generate();
  const eventStream = new Subject<ContractEvent>();

  new EventIngestor(
    utxoStore,
    nullifierStore,
    eventStream.asObservable().pipe(share()),
    mykeypair
  ).connect();

  const notes = [
    new Utxo({
      amount: BigNumber.from(100),
      keypair: mykeypair,
      index: 0,
      blinding: BigNumber.from(100),
    }),
    new Utxo({
      amount: BigNumber.from(200),
      keypair: mykeypair,
      index: 1,
      blinding: BigNumber.from(200),
    }),
    new Utxo({
      amount: BigNumber.from(300),
      keypair: yourkeypair,
      index: 2,
      blinding: BigNumber.from(300),
    }),
    new Utxo({
      amount: BigNumber.from(400),
      keypair: mykeypair,
      index: 3,
      blinding: BigNumber.from(400),
    }),
  ];

  notes.forEach((note) => {
    console.log("Sending note...");
    eventStream.next({
      commitment: `${fieldToObject(note.getCommitment())}`,
      encryptedOutput: note.encrypt(),
      index: note.index || 0,
      type: "NewCommitment",
    });
  });

  const storedUtxos = await utxoStore.getAll();
  console.log(storedUtxos);
});
