import { IndexDbStore } from "../store/index_db_store";
import { indexedDB } from "fake-indexeddb";
import { deleteDB } from "../test_utils";

describe("IndexDbStore", () => {
  const tableName = "testStore";
  const dbName = "mydb";

  async function getDb() {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onsuccess = () => {
        resolve(req.result);
      };

      req.onerror = () => {
        reject(req.error);
      };

      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore(tableName);
      };
    });
  }

  async function getStore<T extends object | string | number | boolean>() {
    return new IndexDbStore<T>(tableName, getDb);
  }

  afterEach(async () => {
    await deleteDB(dbName);
  });

  test("add and get data", async () => {
    const store = await getStore<string>();
    const id = "testId";
    const data = "testData";

    // Add data to the store
    const addResult = await store.add(id, data);
    expect(addResult).toBe(true);

    // Retrieve the data from the store
    const getResult = await store.get(id);
    expect(getResult).toBe(data);
  });

  test("get nonexistent data", async () => {
    const store = await getStore<string>();
    const id = "nonexistentId";

    // Retrieve nonexistent data from the store
    const getResult = await store.get(id);
    expect(getResult).toBe(undefined);
  });

  test("get all data", async () => {
    const store = await getStore<number>();
    const testData = [1, 2, 3];

    // Add test data to the store
    for (let i = 0; i < testData.length; i++) {
      await store.add(String(i), testData[i]);
    }

    // Retrieve all data from the store
    const allData = await store.getAll();
    expect(allData).toEqual(testData);
  });

  test("remove data", async () => {
    const store = await getStore<boolean>();
    const id = "testId";
    const data = true;

    // Add data to the store
    await store.add(id, data);

    // Remove the data from the store
    const removeResult = await store.remove(id);
    expect(removeResult).toBe(true);

    // Try to retrieve the removed data from the store
    const getResult = await store.get(id);
    expect(getResult).toBe(undefined);
  });

  test("remove all data", async () => {
    const store = await getStore<string>();
    const testData = ["a", "b", "c"];

    // Add test data to the store
    for (let i = 0; i < testData.length; i++) {
      await store.add(String(i), testData[i]);
    }

    // Remove all data from the store
    const removeAllResult = await store.removeAll();
    expect(removeAllResult).toBe(true);

    // Try to retrieve the removed data from the store
    const allData = await store.getAll();
    expect(allData).toEqual([]);
  });
});
