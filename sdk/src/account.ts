import { EventStoreWriter } from "./event_store_writer";
import { Keypair } from "./keypair";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { PasswordEncryptor } from "./password_encryptor";
import { AccountStore } from "./account_store";
import { Utxo } from "./utxo";
import { ShieldedPoolProver } from "./shielded_pool";
import { buildMerkleTree } from "./merkle_tree";
import { GenerateProofFn, generateProof } from "./generate_proof";
import { SwapParams } from "./types";

export class Account {
  private keypair?: Keypair;
  private prover?: ShieldedPoolProver;
  private eventStoreWriter?: EventStoreWriter;
  public unsubscribeBlocks: () => void = () => {};
  constructor(
    private contract: ethers.Contract,
    public signer: ethers.Signer,
    private encryptor: PasswordEncryptor,
    private proofGen: GenerateProofFn = generateProof
  ) {}

  public isLoggedIn() {
    return !!this.keypair && !!this.encryptor && !!this.eventStoreWriter;
  }

  async login() {
    try {
      const state = new AccountStore(this.encryptor);
      const keypair =
        (await state.getKeypair()) ?? (await Keypair.fromSigner(this.signer));
      this.keypair = keypair;
      this.eventStoreWriter = new EventStoreWriter(
        this.contract,
        keypair,
        this.encryptor
      );
      await this.eventStoreWriter.start();
    } catch (err) {
      throw new Error("LOGIN_FAILURE");
    }
  }

  private getEventStoreWriter() {
    if (this.eventStoreWriter) return this.eventStoreWriter;
    throw new Error("USER_NOT_LOGGED_IN");
  }

  private getStore() {
    return this.getEventStoreWriter().store();
  }

  onBlock(handler: (blocknumber: number) => void) {
    if (!this.signer.provider) throw new Error("NO_PROVIDER");
    const provider = this.signer.provider;
    provider.on("block", handler);
    this.unsubscribeBlocks = () => {
      provider.off("block", handler);
    };
  }

  getKeypair() {
    if (this.keypair) {
      return this.keypair;
    }
    throw new Error("USER_NOT_LOGGED_IN");
  }

  async getUtxosUpTo(amount: BigNumberish, asset: BigNumberish) {
    return await this.getStore().getUtxosUpTo(amount, asset);
  }

  async getBalance(asset: BigNumberish = 0) {
    return await this.getStore().getBalance(asset);
  }

  async getTree() {
    return await buildMerkleTree(this.contract);
  }

  createUtxo(amount: BigNumberish, asset: BigNumberish) {
    return new Utxo({ asset, amount, keypair: this.getKeypair() });
  }

  async proveShield(
    amount: BigNumberish,
    asset: BigNumberish = 0,
    swapParams: SwapParams = {
      tokenOut: BigNumber.from(0),
      amountOutMin: BigNumber.from(0),
      swapRecipient: BigNumber.from(0),
      swapRouter: BigNumber.from(0),
      swapData: BigNumber.from(0),
      transactData: BigNumber.from(0),
    }
  ) {
    return await this.getProver().shield(amount, asset, swapParams);
  }

  async proveUnshield(
    amount: BigNumberish,
    recipient: string,
    asset: BigNumberish = 0,
    swapParams: SwapParams = {
      tokenOut: BigNumber.from(0),
      amountOutMin: BigNumber.from(0),
      swapRecipient: BigNumber.from(0),
      swapRouter: BigNumber.from(0),
      swapData: BigNumber.from(0),
      transactData: BigNumber.from(0),
    }
  ) {
    return await this.getProver().unshield(
      amount,
      recipient,
      asset,
      swapParams
    );
  }

  async proveTransfer(
    amount: BigNumberish,
    toPubkey: string,
    asset: BigNumberish = 0,
    swapParams: SwapParams = {
      tokenOut: BigNumber.from(0),
      amountOutMin: BigNumber.from(0),
      swapRecipient: BigNumber.from(0),
      swapRouter: BigNumber.from(0),
      swapData: BigNumber.from(0),
      transactData: BigNumber.from(0),
    }
  ) {
    return await this.getProver().transfer(amount, toPubkey, asset, swapParams);
  }

  private getProver() {
    if (this.prover) return this.prover;
    this.prover = new ShieldedPoolProver(this, this.proofGen);
    return this.prover;
  }

  destroy() {
    this.unsubscribeBlocks();
    this.getEventStoreWriter().stop();
  }

  static async create(
    contract: ethers.Contract,
    signer: ethers.Signer,
    password: string,
    proofGen: GenerateProofFn = generateProof
  ): Promise<Account> {
    // Ensure password length > 16
    const encryptor = PasswordEncryptor.fromPassword(password);
    return new Account(contract, signer, encryptor, proofGen);
  }
}
