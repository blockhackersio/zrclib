import { Store } from "../types";

// Wrap a Map in the Store interface
export class InMemoryStore<T extends object | string | number>
  implements Store<T>
{
  constructor(private _data: Map<string, T> = new Map()) {}

  async add(id: string, data: T): Promise<boolean> {
    this._data.set(id, data);
    return true;
  }

  async getAll() {
    let items: T[] = [];
    for (const item of this._data.values()) {
      items.push(item);
    }
    return items;
  }

  async get(id: string): Promise<T | undefined> {
    return this._data.get(id);
  }

  async remove(id: string): Promise<boolean> {
    return this._data.delete(id);
  }

  async removeAll() {
    this._data.clear();
    return true;
  }
}
