import {
  encrypt,
  decrypt,
  generateKeyFromPassword,
  PasswordEncryptor,
} from "./password_encryptor";

test("hello", async () => {
  const password = "your-password-here";
  const key = await generateKeyFromPassword(password);
  const key2 = await generateKeyFromPassword(password);
  expect(key).toEqual(key2);
  const data = { message: "Hello, world!" };
  let start = Date.now();
  const encrypted = await encrypt(data, key);
  expect(encrypted).toBe(
    "0102030405060708090a0b0c0d0e0f10428d717d15f5110e173f605f182d0e24cca8a9bccd7d7897d6135f"
  );
  start = Date.now();
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toEqual({ message: "Hello, world!" });
});

test("PasswordEncryptor", async () => {
  const password = "your-password-here";

  const encryptor = PasswordEncryptor.fromPassword(password);
  const data = { message: "Hello, world!" };
  let start = Date.now();
  const encrypted = await encryptor.encrypt(data);
  expect(encrypted).toBe(
    "0102030405060708090a0b0c0d0e0f10428d717d15f5110e173f605f182d0e24cca8a9bccd7d7897d6135f"
  );
  start = Date.now();
  const decrypted = await encryptor.decrypt(encrypted);
  expect(decrypted).toEqual({ message: "Hello, world!" });
});
