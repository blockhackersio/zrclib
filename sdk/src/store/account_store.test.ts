import { BigNumber } from "ethers";
import { AccountStore } from "../store/account_store";
import { PasswordEncryptor } from "../password_encryptor";
import { Utxo, printIntArray } from "../utxo";
import { Keypair } from "../keypair";
import { fieldToString } from "../poseidon";
import { toFixedHex } from "../utils";
import { deleteDB } from "../test_utils";
import { EncryptedDb, getDbName } from "./db";

jest.setTimeout(10000);
describe("AccountStore", () => {
  const password = "mySecretPassword";
  let storeKey: PasswordEncryptor;
  let accountState: AccountStore;
  let db: EncryptedDb;

  beforeEach(async () => {
    // Need to ensure poseidon is initialized
    await Keypair.generate();

    storeKey = PasswordEncryptor.fromPassword(password);
    db = await EncryptedDb.create(storeKey, 0);
    accountState = new AccountStore(db);
  });

  afterEach(async () => {
    await deleteDB(getDbName(0));
  });

  test("should add an unspent Utxo to the store", async () => {
    const utxo = new Utxo({ amount: 1000, index: 1 });
    await accountState.addUtxo(utxo);

    const allUnspent = await accountState.getUnspentUtxos();
    const unspent = allUnspent[0]; // By default asset type is 0

    expect(unspent.length).toBe(1);
    expect(unspent[0].getCommitment()).toEqual(utxo.getCommitment());
  });

  test("Adding a Utxo's nullifier will spend the Utxo", async () => {
    const utxo = new Utxo({ amount: 1000, index: 1 });
    await accountState.addUtxo(utxo);
    await accountState.addNullifier(
      toFixedHex(fieldToString(utxo.getNullifier()))
    );
    const allUnspent = await accountState.getUnspentUtxos();
    const unspent = allUnspent[0]; // By default asset type is 0
    expect(unspent).toBe(undefined);
  });

  test("getUtxosUpTo should return an array of Utxos that add up to the requested amount", async () => {
    const utxo1 = new Utxo({ amount: 100, index: 1 });
    const utxo2 = new Utxo({ amount: 200, index: 2 });
    const utxo3 = new Utxo({ amount: 300, index: 3 });
    const printedUintArr = [utxo1, utxo2, utxo3].map((u) =>
      printIntArray(u.getCommitment())
    );
    await accountState.addUtxo(utxo1);
    await accountState.addUtxo(utxo2);
    await accountState.addUtxo(utxo3);

    const result = await accountState.getUtxosUpTo(BigNumber.from(250), 0);

    const resultCommitments = result.map((u) =>
      printIntArray(u.getCommitment())
    );

    // console.log(resultCommitments);
    expect(resultCommitments).toEqual([printedUintArr[0], printedUintArr[1]]);
  });

  test("getUtxosUpTo should throw an error if there are not enough unspent Utxos to fulfill the request", async () => {
    const utxo = new Utxo({ amount: 100, index: 1 });
    await accountState.addUtxo(utxo);

    await expect(
      accountState.getUtxosUpTo(BigNumber.from(200), 0)
    ).rejects.toThrow("INSUFFICIENT_BALANCE");
  });

  test("getBalance should get the balance", async () => {
    const resultZero = await accountState.getBalance(0);
    expect(resultZero.toNumber()).toBe(0);
    const utxo1 = new Utxo({ amount: 100, index: 1 });
    const utxo2 = new Utxo({ amount: 200, index: 2 });
    const utxo3 = new Utxo({ amount: 300, index: 3 });
    await accountState.addUtxo(utxo1);
    await accountState.addUtxo(utxo2);
    await accountState.addUtxo(utxo3);
    const result = await accountState.getBalance(0);
    expect(result.toNumber()).toBe(600);
  });

  test("setKeypair", async () => {
    const keypair = await Keypair.generate();
    const success = await accountState.setKeypair("someaddress", keypair);
    expect(success).toBe(true);
    const recieved = await accountState.getKeypair("someaddress");
    expect(`${recieved}`).toBe(`${keypair}`);
  });
});
