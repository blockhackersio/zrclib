import { Utxo } from "./index";
import { Keypair } from "./keypair";
import { setupPoseidon } from "./poseidon";
// import { buildPoseidon } from "circomlibjs";
test("Keypair", async () => {
  // const hashFn = buildPoseidon();
  await setupPoseidon();
  const alice = new Keypair();
  const hundred = new Utxo({ amount: 100, keypair: alice });
});
