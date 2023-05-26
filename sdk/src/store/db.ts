import { Keypair, KeypairSerializer } from "../keypair";
import { PasswordEncryptor } from "../password_encryptor";
import { JSONSerializer } from "../serializer";
import { Store } from "../types";
import { Utxo, UtxoSerializer } from "../utxo";
import { EncryptedStore } from "./encrypted_store";
import { IndexDbStore } from "./index_db_store";
import { indexedDB } from "fake-indexeddb";

export function getDbName(chainId: number) {
  return "_zrc_" + chainId;
}

const Tables = {
  UTXO: "utxo",
  KEYPAIR: "keypair",
  NULLIFIERS: "nullifiers",
  LATESTBLOCK: "latestBlock",
  PUBLICKEYS: "publickeys",
};

export function openDatabase(chainId: number) {
  return async () => {
    const idbFactory = getIndexDBFactory();
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = idbFactory.open(getDbName(chainId));

      request.onerror = () => {
        reject(new Error(`Failed to open database zrclib`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore(Tables.UTXO);
        db.createObjectStore(Tables.KEYPAIR);
        db.createObjectStore(Tables.NULLIFIERS);
        db.createObjectStore(Tables.LATESTBLOCK);
        db.createObjectStore(Tables.PUBLICKEYS);
      };
    });

    return database;
  };
}

export class PlaintextDB {
  constructor(
    // config
    getIndexDb: () => Promise<IDBDatabase>,

    // Configuration
    // Unencrypted publickey store publickey -> keyname
    private _publicKeyStore: Store<string> = new IndexDbStore(
      Tables.PUBLICKEYS,
      getIndexDb
    )
  ) {}

  get publicKeys() {
    return this._publicKeyStore;
  }
  static async create(chainId: number) {
    return new PlaintextDB(openDatabase(chainId));
  }
}

export class EncryptedDb {
  constructor(
    // config
    storeKey: PasswordEncryptor,
    getIndexDb: () => Promise<IDBDatabase>,

    // Configuration
    // Unencrypted publickey store publickey -> keyname
    private _publicKeyStore: Store<string> = new IndexDbStore(
      Tables.PUBLICKEYS,
      getIndexDb
    ),

    private _utxoStore: Store<Utxo> = new EncryptedStore(
      storeKey,
      new UtxoSerializer(),
      new IndexDbStore(Tables.UTXO, getIndexDb)
    ),

    private _keypairStore: Store<Keypair> = new EncryptedStore<Keypair>(
      storeKey,
      new KeypairSerializer(),
      new IndexDbStore(Tables.KEYPAIR, getIndexDb)
    ),

    private _nullifier: Store<number> = new EncryptedStore(
      storeKey,
      new JSONSerializer(),
      new IndexDbStore(Tables.NULLIFIERS, getIndexDb)
    ),

    private _latestBlock: Store<number> = new EncryptedStore(
      storeKey,
      new JSONSerializer(),
      new IndexDbStore(Tables.LATESTBLOCK, getIndexDb)
    )
  ) {}

  get utxos() {
    return this._utxoStore;
  }

  get nullifiers() {
    return this._nullifier;
  }

  get keypairs() {
    return this._keypairStore;
  }

  get latestBlock() {
    return this._latestBlock;
  }

  get publicKeys() {
    return this._publicKeyStore;
  }

  static async create(storeKey: PasswordEncryptor, chainId: number) {
    return new EncryptedDb(storeKey, openDatabase(chainId));
  }
}

export function getTableName(chainId: number, name: string): string {
  return `_zrc_${chainId}_${name}`;
}

function getIndexDBFactory(): IDBFactory {
  if (typeof window === "undefined") return indexedDB;
  return window.indexedDB;
}
