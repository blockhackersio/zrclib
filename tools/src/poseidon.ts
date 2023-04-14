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
  return BigNumber.from(poseidonHash([a, b])).toString();
}

export function fieldToObject(input: BigNumberish): bigint {
  // poseidon has the Field attached to the function
  return (poseidon as any).F.toObject(input);
}

// This needs to be run ahead of time to ensure that
// the poseidon function is initialized
export async function setupPoseidon() {
  poseidon = await buildPoseidon();
}
