import { InMemoryStore } from "./in_memory_store";
import { PasswordEncryptor } from "../password_encryptor";
import { JSONSerializer, Serializer } from "../serializer";
import { Store } from "../types";

export class EncryptedStore<T extends object | string | number>
  implements Store<T>
{
  constructor(
    private _encryptor: PasswordEncryptor,
    private _serializer: Serializer<T> = new JSONSerializer<T>(),
    private _store: Store<string> = new InMemoryStore()
  ) {}

  async add(id: string, data: T): Promise<boolean> {
    try {
      const serialized = this._serializer.serialize(data);
      const encrypted = await this._encryptor.encrypt(serialized);
      return this._store.add(id, encrypted);
    } catch (err) {
      return false;
    }
  }

  async getAll(): Promise<T[]> {
    const encryptedItems = await this._store.getAll();
    const items = await Promise.all(
      encryptedItems.map(async (item) => {
        try {
          const decrypted = await this._encryptor.decrypt(item);
          return this._serializer.deserialize(decrypted);
        } catch (err) {
          throw new Error("DECRYPTION_FAILURE");
        }
      })
    );
    return items;
  }

  async get(id: string): Promise<T | undefined> {
    const encryptedItem = await this._store.get(id);
    if (!encryptedItem) return;
    try {
      const decrypted = await this._encryptor.decrypt(encryptedItem);
      return this._serializer.deserialize(decrypted);
    } catch (err) {
      throw new Error("DECRYPTION_FAILURE");
    }
  }

  async remove(id: string): Promise<boolean> {
    return this._store.remove(id);
  }

  async removeAll() {
    this._store.removeAll();
    return true;
  }
}
