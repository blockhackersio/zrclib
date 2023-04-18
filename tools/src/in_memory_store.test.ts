import { InMemoryStore } from "./in_memory_store";

describe("InMemoryStore", () => {
  let store: InMemoryStore<string>;

  beforeEach(() => {
    store = new InMemoryStore<string>();
  });

  it("should add and retrieve items", async () => {
    // Add an item to the store
    const added = await store.add("1", "foo");
    expect(added).toBe(true);

    // Retrieve the item from the store
    const retrieved = await store.get("1");
    expect(retrieved).toBe("foo");
  });

  it("should remove items", async () => {
    // Add an item to the store
    await store.add("1", "foo");

    // Remove the item from the store
    const removed = await store.remove("1");
    expect(removed).toBe(true);

    // Verify that the item was removed
    const retrieved = await store.get("1");
    expect(retrieved).toBeUndefined();
  });

  it("should remove all items", async () => {
    // Add some items to the store
    await store.add("1", "foo");
    await store.add("2", "bar");

    // Remove all items from the store
    const removed = await store.removeAll();
    expect(removed).toBe(true);

    // Verify that all items were removed
    const allItems = await store.getAll();
    expect(allItems).toHaveLength(0);
  });
});
