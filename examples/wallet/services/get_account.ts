import { Account, GenerateProofFn } from "@zrclib/sdk";
import { BigNumberish, Contract, Signer } from "ethers";
import { getProver } from "./get_prover";
import { SwapParams } from "@/../../sdk/src/types";

export class ZrclibAccount {
  private account?: Account;
  constructor(private generateProofFn: GenerateProofFn) {}

  async createAndLogin(contract: Contract, signer: Signer, password: string) {
    const account = await Account.create(
      contract,
      signer,
      password,
      this.generateProofFn // pass in webworker prover
    );
    await account.login();
    this.account = account;
  }

  logout() {
    this.getAccount().destroy();
  }

  isLoggedIn() {
    return this.getAccount().isLoggedIn();
  }

  getAccount() {
    if (!this.account) throw new Error("ACCOUNT_NOT_CREATED");
    return this.account;
  }

  async proveShield(
    amount: BigNumberish,
    asset?: BigNumberish,
    swapParams?: SwapParams
  ) {
    return await this.getAccount().proveShield(amount, asset, swapParams);
  }

  async proveUnshield(
    amount: BigNumberish,
    recipient: string,
    asset?: BigNumberish,
    swapParams?: SwapParams
  ) {
    return await this.getAccount().proveUnshield(
      amount,
      recipient,
      asset,
      swapParams
    );
  }

  async proveTransfer(
    amount: BigNumberish,
    toPubkey: string,
    asset?: BigNumberish,
    swapParams?: SwapParams
  ) {
    return await this.getAccount().proveTransfer(
      amount,
      toPubkey,
      asset,
      swapParams
    );
  }

  private static _instance: ZrclibAccount;
  static getInstance() {
    if (!this._instance) {
      // get prover from web worker so zkp is calculated in it's own thread
      const generateProverFn = getProver();

      if (!generateProverFn)
        throw new Error("Could not connect to webworker prover!");

      this._instance = new ZrclibAccount(generateProverFn);
    }
    return this._instance;
  }
}
