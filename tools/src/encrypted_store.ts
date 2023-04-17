import { InMemoryStore } from "./in_memory_store";
import { Encryptor } from "./isomorphic_encrypt";
import { Store } from "./types";

export class EncryptedStore<T extends object> implements Store<T> {
  private _encryptor: Encryptor;
  constructor(
    _pass: string,
    private _store: Store<string> = new InMemoryStore()
  ) {
    this._encryptor = Encryptor.fromPassword(_pass);
  }

  async add(id: string, data: T): Promise<boolean> {
    const encrypted = await this._encryptor.encrypt(data);
    this._store.add(id, encrypted);
    return true;
  }

  async getAll(): Promise<T[]> {
    const encryptedItems = await this._store.getAll();
    const encryptor = this._encryptor;
    const items: T[] = await Promise.all(
      encryptedItems.map((item) => {
        return encryptor.decrypt<T>(item);
      })
    );
    return items;
  }

  async get(id: string): Promise<T | undefined> {
    const encryptedItem = await this._store.get(id);
    if (!encryptedItem) return;
    const encryptor = this._encryptor;
    return await encryptor.decrypt<T>(encryptedItem);
  }

  async remove(id: string): Promise<boolean> {
    return this._store.remove(id);
  }

  async removeAll() {
    this._store.removeAll();
    return true;
  }
}
