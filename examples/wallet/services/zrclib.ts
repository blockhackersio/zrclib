import { Account, GenerateProofFn, generateProof } from "@zrclib/sdk";
import { BigNumber, BigNumberish, Contract, Signer } from "ethers";
import { getProver } from "./get_prover";
import { SwapParams } from "@/../../sdk/src/types";
import { Tokens, getContract, getTokens } from "@/contracts/get_contract";
import type { MockErc20 } from "@/../../tests/typechain-types";
export type AccountBalances = {
  // address -> balance
  privateBalances: Map<string, BigNumber>;
  publicBalances: Map<string, BigNumber>;
};

// function getDefaultBalances() {}

export class ZrclibAccount {
  private account?: Account;
  constructor(private generateProofFn: GenerateProofFn = generateProof) {}

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
    try {
      return this.getAccount().isLoggedIn();
    } catch (e) {
      return false;
    }
  }

  onBlock(handler: (block: number) => void) {
    return this.getAccount().onBlock(handler);
  }

  async getBalances(): Promise<AccountBalances> {
    console.log("getBalances");
    if (!this.account) {
      console.log("no account set");
      return {
        privateBalances: new Map(),
        publicBalances: new Map(),
      };
    }
    const privateBalances = new Map();
    const publicBalances = new Map();
    const tokens = getTokens();

    // TODO paralelize this...
    for (const token of tokens) {
      const signer = this.getAccount().signer;
      const contract = getContract(
        token,
        await this.account.signer.getChainId(),
        this.account.signer
      ).connect(signer) as MockErc20;
      const publicBal = (await contract.balanceOf(
        await signer.getAddress()
      )) as BigNumber;
      const privateBal = await this.getAccount().getBalance(
        BigNumber.from(contract.address)
      );
      console.log({
        token,
        address: contract.address,
        publicBal,
        privateBal,
      });
      publicBalances.set(contract.address, publicBal);
      privateBalances.set(contract.address, privateBal);
    }

    return { privateBalances, publicBalances };
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
      this._instance = new ZrclibAccount(generateProverFn);
    }
    return this._instance;
  }
}
