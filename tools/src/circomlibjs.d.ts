declare module "circomlibjs" {
  export = circomlibjs;

  type PoseidonFn = (a: BigNumberish[]) => BigNumber;
  declare const circomlibjs: {
    buildPoseidon: () => Promise<PoseidonFn>;
  };
}
