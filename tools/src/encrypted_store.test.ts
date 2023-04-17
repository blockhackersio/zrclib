import { EncryptedStore } from "./encrypted_store";
import { InMemoryStore } from "./in_memory_store";

describe("EncryptedStore", () => {
  let encryptedStore: EncryptedStore<{ name: string }>;
  let memory: InMemoryStore<string> = new InMemoryStore();

  beforeEach(() => {
    encryptedStore = new EncryptedStore("password", memory);
  });

  afterEach(async () => {
    await encryptedStore.removeAll();
  });

  it("should add and get an item", async () => {
    const item = { name: "test" };
    const id = "1";

    await encryptedStore.add(id, item);
    const retrievedItem = await encryptedStore.get(id);

    expect(retrievedItem).toEqual(item);
  });

  it("should return undefined if the item does not exist", async () => {
    const retrievedItem = await encryptedStore.get("nonexistent");

    expect(retrievedItem).toBeUndefined();
  });

  it("should remove an item", async () => {
    const item = { name: "test" };
    const id = "1";

    await encryptedStore.add(id, item);
    const success = await encryptedStore.remove(id);

    expect(success).toBeTruthy();
    const retrievedItem = await encryptedStore.get(id);
    expect(retrievedItem).toBeUndefined();
  });

  it("should remove all items", async () => {
    const item1 = { name: "test1" };
    const item2 = { name: "test2" };

    await encryptedStore.add("1", item1);
    await encryptedStore.add("2", item2);
    await encryptedStore.removeAll();

    const retrievedItem1 = await encryptedStore.get("1");
    const retrievedItem2 = await encryptedStore.get("2");

    expect(retrievedItem1).toBeUndefined();
    expect(retrievedItem2).toBeUndefined();
  });

  it("should get all items", async () => {
    const item1 = { name: "test1" };
    const item2 = { name: "test2" };

    await encryptedStore.add("1", item1);
    await encryptedStore.add("2", item2);

    const allItems = await encryptedStore.getAll();

    expect(allItems).toEqual([item1, item2]);
  });

  it("should not be able to be accessed by using the wrong password", async () => {
    const storeAccess = new EncryptedStore("password", memory);
    const storeNoAccess = new EncryptedStore("some other password", memory);

    const msg = { message: "I am a piece of text" };
    await storeAccess.add("mything", msg);
    expect(memory.getAll()).resolves.toEqual([
      "0102030405060708090a0b0c0d0e0f10d33b9e353f10bc2cf24cf4ce4cf538539899dd1d766140a0d0ff0c2fbeacf897c5d9",
    ]);
    expect(storeAccess.get("mything")).resolves.toEqual(msg);
    expect(storeNoAccess.get("mything")).rejects.toThrow("DECRYPTION_FAILURE");
  });
});
