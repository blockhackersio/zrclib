import { Store } from "../types";
// import { indexedDB } from "fake-indexeddb";

export function promisifyDbTransaction<T>(
  tx: IDBTransaction,
  request: IDBRequest,
  name = "unnamed"
): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result as T);
    };

    request.onerror = () => {
      reject(request.error);
    };

    tx.oncomplete = () => {
      // resolve(request.result as T);
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

function sortByNonce<T>(data: StorageWrapper<T>[]): StorageWrapper<T>[] {
  return [...data].sort((a, b) => {
    if (a.nonce > b.nonce) return 1;
    if (a.nonce == b.nonce) return 0;
    return -1;
  });
}

type StorageWrapper<T> = { data: T; nonce: number };
export class IndexDbStore<T extends object | string | number | boolean>
  implements Store<T>
{
  private nonce = 0;

  constructor(
    private readonly table: string,
    private readonly getDb: () => Promise<IDBDatabase>
  ) {}

  async add(id: string, data: T): Promise<boolean> {
    // console.log("-add");
    const db = await this.getDb();
    const tx = db.transaction(this.table, "readwrite");
    const store = tx.objectStore(this.table);
    try {
      const nonce = this.nonce++;
      const request = store.add({ nonce, data }, id);
      await promisifyDbTransaction(tx, request, "add");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      db.close();
    }
  }

  async get(id: string): Promise<T | undefined> {
    // console.log("-get");
    const db = await this.getDb();
    const tx = db.transaction(this.table, "readonly");
    const store = tx.objectStore(this.table);
    try {
      const request = store.get(id);
      const response = await promisifyDbTransaction<StorageWrapper<T>>(
        tx,
        request,
        "get"
      );
      if (!response) return;
      const { data } = response;
      return data;
    } catch (error) {
      console.log(error);
      return undefined;
    } finally {
      db.close();
    }
  }

  async getAll(): Promise<T[]> {
    // console.log("-getAll");

    const db = await this.getDb();
    const tx = db.transaction(this.table, "readonly");
    const store = tx.objectStore(this.table);
    try {
      const allData: T[] = [];
      const request = store.getAll();
      const data = await promisifyDbTransaction<StorageWrapper<T>[]>(
        tx,
        request,
        "getAll"
      );
      allData.push(...sortByNonce(data).map(({ data }) => data));
      return allData;
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      db.close();
    }
  }

  async remove(id: string): Promise<boolean> {
    // console.log("-remove");
    const db = await this.getDb();
    const tx = db.transaction(this.table, "readwrite");
    const store = tx.objectStore(this.table);
    try {
      const request = store.delete(id);
      await promisifyDbTransaction(tx, request);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      db.close();
    }
  }

  async removeAll(): Promise<boolean> {
    // console.log("-removeAll");
    const db = await this.getDb();
    const tx = db.transaction(this.table, "readwrite");
    const store = tx.objectStore(this.table);
    try {
      const request = store.clear();
      await promisifyDbTransaction(tx, request);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      db.close();
    }
  }
}
