import { BigNumber } from "ethers";
import { AccountStore } from "./account_store";
import { PasswordEncryptor } from "./password_encryptor";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";

describe("AccountStore", () => {
  const password = "mySecretPassword";
  let storeKey: PasswordEncryptor;
  let accountState: AccountStore;

  beforeEach(async () => {
    // Need to ensure poseidon is initialized
    await Keypair.generate();
    storeKey = PasswordEncryptor.fromPassword(password);
    accountState = new AccountStore(storeKey);
  });

  test("should add an unspent Utxo to the store", async () => {
    const utxo = new Utxo({ amount: 1000, index: 1 });
    await accountState.addUtxo(utxo);

    const unspent = await accountState.getUnspentUtxos();

    expect(unspent.length).toBe(1);
    expect(unspent[0].getCommitment()).toEqual(utxo.getCommitment());
  });

  test("Adding a Utxo's nullifier will spend the Utxo", async () => {
    const utxo = new Utxo({ amount: 1000, index: 1 });
    await accountState.addUtxo(utxo);
    await accountState.addNullifier(utxo.getNullifier());
    const unspent = await accountState.getUnspentUtxos();
    expect(unspent.length).toBe(0);
  });

  test("getUtxosUpTo should return an array of Utxos that add up to the requested amount", async () => {
    const utxo1 = new Utxo({ amount: 100, index: 1 });
    const utxo2 = new Utxo({ amount: 200, index: 2 });
    const utxo3 = new Utxo({ amount: 300, index: 3 });
    await accountState.addUtxo(utxo1);
    await accountState.addUtxo(utxo2);
    await accountState.addUtxo(utxo3);

    const result = await accountState.getUtxosUpTo(BigNumber.from(250));
    expect(result.map((u) => u.getCommitment())).toEqual([
      utxo1.getCommitment(),
      utxo2.getCommitment(),
    ]);
  });

  test("getUtxosUpTo should throw an error if there are not enough unspent Utxos to fulfill the request", async () => {
    const utxo = new Utxo({ amount: 100, index: 1 });
    await accountState.addUtxo(utxo);

    await expect(
      accountState.getUtxosUpTo(BigNumber.from(200))
    ).rejects.toThrow("INSUFFICIENT_BALANCE");
  });

  test("getBalance should get the balance", async () => {
    const resultZero = await accountState.getBalance();
    expect(resultZero.toNumber()).toBe(0);
    const utxo1 = new Utxo({ amount: 100, index: 1 });
    const utxo2 = new Utxo({ amount: 200, index: 2 });
    const utxo3 = new Utxo({ amount: 300, index: 3 });
    await accountState.addUtxo(utxo1);
    await accountState.addUtxo(utxo2);
    await accountState.addUtxo(utxo3);
    const result = await accountState.getBalance();
    expect(result.toNumber()).toBe(600);
  });

  test("setKeypair", async () => {
    const keypair = await Keypair.generate();
    const success = await accountState.setKeypair(keypair);
    expect(success).toBe(true);
    const recieved = await accountState.getKeypair();
    expect(`${recieved}`).toBe(`${keypair}`);
  });
});
