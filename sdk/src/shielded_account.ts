import { EventStoreWriter } from "./event_store_writer";
import { Keypair } from "./keypair";
import { BigNumberish, ethers } from "ethers";
import { PasswordEncryptor } from "./password_encryptor";
import { AccountStore } from "./account_store";
import { Utxo } from "./utxo";
import { ShieldedPoolProver } from "./shielded_pool";
import { buildMerkleTree } from "./buildMerkleTree";

export class Account {
  private keypair?: Keypair;
  private prover?: ShieldedPoolProver;
  private eventStoreWriter?: EventStoreWriter;
  constructor(
    private contract: ethers.Contract,
    public signer: ethers.Signer,
    private encryptor: PasswordEncryptor
  ) {}

  isLoggedIn() {
    !!this.keypair && !!this.encryptor && !!this.eventStoreWriter;
  }

  async login() {
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
  }

  private getEventStoreWriter() {
    if (this.eventStoreWriter) return this.eventStoreWriter;
    throw new Error("USER_NOT_LOGGED_IN");
  }

  private getStore() {
    return this.getEventStoreWriter().store();
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

  async proveShield(amount: BigNumberish, asset: BigNumberish = 0) {
    return await this.getProver().shield(amount, asset);
  }

  async proveUnshield(
    amount: BigNumberish,
    recipient: string,
    asset: BigNumberish = 0
  ) {
    return await this.getProver().unshield(amount, recipient, asset);
  }

  async proveTransfer(
    amount: BigNumberish,
    toPubkey: string,
    asset: BigNumberish = 0
  ) {
    return await this.getProver().transfer(amount, toPubkey, asset);
  }

  private getProver() {
    if (this.prover) return this.prover;
    this.prover = new ShieldedPoolProver(this);
    return this.prover;
  }

  destroy() {
    this.getEventStoreWriter().stop();
  }

  static async create(
    contract: ethers.Contract,
    signer: ethers.Signer,
    password: string
  ): Promise<Account> {
    // Ensure password length > 16
    const encryptor = PasswordEncryptor.fromPassword(password);
    return new Account(contract, signer, encryptor);
  }
}
