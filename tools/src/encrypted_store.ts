import { InMemoryStore } from "./in_memory_store";
import { PasswordEncryptor } from "./password_encryptor";
import { Store } from "./types";

export class EncryptedStore<T extends object | string | number>
  implements Store<T>
{
  constructor(
    private encryptor: PasswordEncryptor,
    private _store: Store<string> = new InMemoryStore()
  ) {}

  async add(id: string, data: T): Promise<boolean> {
    const encrypted = await this.encryptor.encrypt(data);
    this._store.add(id, encrypted);
    return true;
  }

  async getAll(): Promise<T[]> {
    const encryptedItems = await this._store.getAll();
    const encryptor = this.encryptor;
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
    const encryptor = this.encryptor;
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
