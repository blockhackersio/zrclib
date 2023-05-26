import { BigNumber } from "ethers";
import { EncryptedStore } from "../store/encrypted_store";
import { InMemoryStore } from "./in_memory_store";
import { PasswordEncryptor } from "../password_encryptor";
import { Utxo, UtxoSerializer } from "../utxo";
import { JSONSerializer } from "../serializer";

describe("EncryptedStore", () => {
  let encryptedStore: EncryptedStore<object>;
  let memory: InMemoryStore<string> = new InMemoryStore();
  let jsonSerializer = new JSONSerializer<object>();
  beforeEach(() => {
    encryptedStore = new EncryptedStore(
      PasswordEncryptor.fromPassword("password"),
      jsonSerializer,
      memory
    );
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
    const password = PasswordEncryptor.fromPassword("password");
    const someOtherPassword = PasswordEncryptor.fromPassword(
      "some other password"
    );
    const storeAccess = new EncryptedStore(password, jsonSerializer, memory);
    const storeNoAccess = new EncryptedStore(
      someOtherPassword,
      jsonSerializer,
      memory
    );

    const msg = { message: "I am a piece of text" };
    await storeAccess.add("mything", msg);
    expect(memory.getAll()).resolves.toEqual([
      "0102030405060708090a0b0c0d0e0f10fb5fc1260dbafc83d9858a7f8deba0529cf4f6e7cd07cde30d0ae4d5d411650da239",
    ]);
    expect(storeAccess.get("mything")).resolves.toEqual(msg);
    expect(storeNoAccess.get("mything")).rejects.toThrow("DECRYPTION_FAILURE");
  });

  it("should be able to reconstitute a complex object", async () => {
    const store = new EncryptedStore(
      PasswordEncryptor.fromPassword("password"),
      new UtxoSerializer(),
      memory
    );
    const utxoIn = new Utxo({
      amount: BigNumber.from(100),
      index: 12,
    });

    expect(await store.add("1", utxoIn)).toBe(true);

    const utxoOut = await store.get("1");
    expect(!!utxoOut).toBe(true);
    expect(utxoOut!.amount).toEqual(utxoIn.amount);
    expect(utxoOut!.blinding).toEqual(utxoIn.blinding);
    expect(utxoOut!.index).toEqual(utxoIn.index);
    expect(utxoOut!.keypair.privkey).toEqual(utxoIn.keypair.privkey);
    expect(utxoOut!.getCommitment()).toEqual(utxoIn.getCommitment());
    expect(utxoOut!.getNullifier()).toEqual(utxoIn.getNullifier());
  });
});
