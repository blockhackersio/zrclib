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
  const encrypted = await encrypt(JSON.stringify(data), key);
  expect(encrypted).toBe(
    "0102030405060708090a0b0c0d0e0f10e48edc68e20d35ea05c045d31819af45c85b4bb1472852127d9947"
  );
  start = Date.now();
  const decrypted = await decrypt(encrypted, key);
  expect(JSON.parse(decrypted)).toEqual({ message: "Hello, world!" });
});

test("PasswordEncryptor", async () => {
  const password = "your-password-here";

  const encryptor = PasswordEncryptor.fromPassword(password);
  const data = { message: "Hello, world!" };
  let start = Date.now();
  const encrypted = await encryptor.encrypt(JSON.stringify(data));
  expect(encrypted).toBe(
    "0102030405060708090a0b0c0d0e0f10e48edc68e20d35ea05c045d31819af45c85b4bb1472852127d9947"
  );
  start = Date.now();
  const decrypted = await encryptor.decrypt(encrypted);
  expect(JSON.parse(decrypted)).toEqual({ message: "Hello, world!" });
});
