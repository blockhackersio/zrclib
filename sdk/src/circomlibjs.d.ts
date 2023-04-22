import { BigNumber, BigNumberish } from "ethers";

declare module "circomlibjs" {
  // export = circomlibjs;

  type PoseidonFn = (a: BigNumberish[]) => Uint8Array;
  export const buildPoseidon: () => Promise<PoseidonFn>;
}
