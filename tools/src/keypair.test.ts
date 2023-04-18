import { Keypair } from "./keypair";

test("keypair", async () => {
  const keypair = await Keypair.generate();
  const address = keypair.address();
  const keypair2 = Keypair.fromString(address);
  expect(keypair2.address()).toEqual(address);
});

test("keypair.encrypt()", async () => {
  const keypair = await Keypair.generate();
  const encrypted = keypair.encrypt(Buffer.from("hello world"));
  const decrypted = keypair.decrypt(encrypted);
  expect(decrypted.toString()).toEqual("hello world");
});
