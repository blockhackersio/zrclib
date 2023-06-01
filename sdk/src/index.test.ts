import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { ensurePoseidon } from "./poseidon";

test("Keypair", async () => {
  // const hashFn = buildPoseidon();
  await ensurePoseidon();
  const alice = new Keypair();
  // Ensure this doesnt blow up
  new Utxo({ amount: 100, keypair: alice });
});
