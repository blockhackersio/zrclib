import { EventStoreWriter } from "./event_store_writer";
import { Keypair } from "./keypair";
import { BigNumberish, ethers, providers } from "ethers";
import { PasswordEncryptor } from "./password_encryptor";
import { AccountStore } from "./account_store";
import { Utxo } from "./utxo";
import { ShieldedPoolProver } from "./shielded_pool";
import { buildMerkleTree } from "./buildMerkleTree";

export class ShieldedAccount {
  private keypair?: Keypair;
  private prover?: ShieldedPoolProver;
  private eventStoreWriter?: EventStoreWriter;
  constructor(
    private contract: ethers.Contract,
    private encryptor: PasswordEncryptor
  ) {}

  isLoggedIn() {
    !!this.keypair && !!this.encryptor && !!this.eventStoreWriter;
  }

  async loginWithEthersSigner(signer: ethers.Signer) {
    const keypair = await Keypair.fromSigner(signer);
    this.keypair = keypair;
    this.eventStoreWriter = new EventStoreWriter(
      this.contract,
      keypair,
      this.encryptor
    );
    await this.eventStoreWriter.start();
  }

  async loginFromLocalCache() {
    // load keypair with encryptor
    const state = new AccountStore(this.encryptor);
    const keypair = await state.getKeypair();
    if (!keypair) {
      throw new Error("NO_CREDENTIALS_FOUND");
    }
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

  async getUtxosUpTo(amount: BigNumberish) {
    return await this.getStore().getUtxosUpTo(amount);
  }

  async getBalance() {
    return await this.getStore().getBalance();
  }

  async getTree() {
    return await buildMerkleTree(this.contract);
  }

  createUtxo(amount: BigNumberish) {
    return new Utxo({ amount, keypair: this.getKeypair() });
  }

  async shield(amount: BigNumberish) {
    return await this.getProver().shield(amount);
  }

  async unshield(amount: BigNumberish, recipient: string) {
    return await this.getProver().unshield(amount, recipient);
  }

  async transfer(amount: BigNumberish, toPubkey: string) {
    return await this.getProver().transfer(amount, toPubkey);
  }

  private getProver() {
    if (this.prover) return this.prover;
    this.prover = new ShieldedPoolProver(this);
    return this.prover;
  }

  static async create(
    contract: ethers.Contract,
    password: string
  ): Promise<ShieldedAccount> {
    // Ensure password length > 16
    const encryptor = PasswordEncryptor.fromPassword(password);
    return new ShieldedAccount(contract, encryptor);
  }
}

type WithStateManager = { eventStoreWriter: EventStoreWriter };
function ensureStatemanager(value: any): value is WithStateManager {
  return !!value.eventStoreWriter;
}
