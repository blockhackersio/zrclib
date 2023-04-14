import { buildPoseidon } from "circomlibjs";
import { BigNumber, BigNumberish } from "ethers";

type PoseidonFn = (a: BigNumberish[]) => BigNumber;

export let poseidon: PoseidonFn = () => {
  throw new Error("Poseidon not initialized!");
};

export function poseidonHash(items: BigNumberish[]) {
  return poseidon(items);
}

export function poseidonHash2(a: BigNumberish, b: BigNumberish) {
  return poseidonHash([a, b]);
}

// This needs to be run ahead of time to ensure that
// the poseidon function is initialized
export async function setupPoseidon() {
  poseidon = await buildPoseidon();
}
