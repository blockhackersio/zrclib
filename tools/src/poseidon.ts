import { buildPoseidon } from "circomlibjs";
import { BigNumber, BigNumberish } from "ethers";

type PoseidonFn = (a: BigNumberish[]) => Uint8Array;

export let poseidon: PoseidonFn = () => {
  throw new Error("Poseidon not initialized!");
};

export function poseidonHash(items: BigNumberish[]): Uint8Array {
  return poseidon(items);
}

export function poseidonHash2(a: BigNumberish, b: BigNumberish): Uint8Array {
  return poseidonHash([a, b]);
}

export function fieldToObject(input: BigNumberish): bigint {
  // poseidon has the Field attached to the function
  return (poseidon as any).F.toObject(input);
}

// This needs to be run ahead of time to ensure that
// the poseidon function is initialized
const promise = buildPoseidon().then((fn) => (poseidon = fn));
export async function ensurePoseidon() {
  await promise;
}
