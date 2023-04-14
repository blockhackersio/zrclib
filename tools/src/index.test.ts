import { Utxo } from "./index";
import { Keypair } from "./keypair";
import { ensurePoseidon } from "./poseidon";
// import { buildPoseidon } from "circomlibjs";
test("Keypair", async () => {
  // const hashFn = buildPoseidon();
  await ensurePoseidon();
  const alice = new Keypair();
  const hundred = new Utxo({ amount: 100, keypair: alice });
});
