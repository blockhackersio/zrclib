import { EventStoreWriter } from "./event_store_writer";
import { Keypair } from "./keypair";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { PasswordEncryptor } from "./password_encryptor";
import { AccountStore } from "./store/account_store";
import { Utxo } from "./utxo";
import { ShieldedPoolProver } from "./shielded_pool";
import { buildBlocklistMerkleTree, buildMerkleTree } from "./merkle_tree";
import { GenerateProofFn, generateGroth16Proof } from "./generate_proof";
import { SwapParams } from "./types";
import { EncryptedDb } from "./store/db";
import { UtxoEventDecryptor } from "./utxo_event_decryptor";
import { TypedEventTarget } from "typescript-event-target";
class BlockEvent extends Event {
  constructor(public blockHeight: number) {
    super("block");
  }
}
type AccountEventMap = {
  loggedIn: Event;
  loggedOut: Event;
  block: BlockEvent;
};

export class Account extends TypedEventTarget<AccountEventMap> {
  private keypair?: Keypair;
  private prover?: ShieldedPoolProver;
  private store?: AccountStore;
  private eventStoreWriter?: EventStoreWriter;
  public unsubscribeBlocks: () => void = () => {};

  constructor(
    private readonly contract: ethers.Contract,
    public readonly signer: ethers.Signer,
    private readonly encryptor: PasswordEncryptor,
    private readonly chainId: number,
    private readonly proofGen: GenerateProofFn = generateGroth16Proof,
    private blocklist: ethers.Contract | null = null
  ) {
    super();
  }

  public isLoggedIn() {
    return !!this.eventStoreWriter;
  }

  async login() {
    try {
      const { encryptor, contract, chainId } = this;
      console.log("login(): Extract data", { encryptor, contract, chainId });
      const address = await this.getEthAddress();
      const keypair = await this.getLocalOrSignedKeypair();
      console.log("login(): Keypair and address", { address, keypair });
      const db = await EncryptedDb.create(encryptor, chainId);
      const store = new AccountStore(db);
      const storeKeypair = await store.getKeypair(address);
      console.log("login(): storeKeypair", { storeKeypair });
      if (!storeKeypair) {
        await store.setKeypair(address, keypair);
        console.log("login(): storeKeypair has been set");
      }
      console.log("login(): creating UtxoEventDecryptor");
      const decryptor = new UtxoEventDecryptor(contract, keypair);
      console.log("login(): creating EventStoreWriter");
      const eventStoreWriter = new EventStoreWriter(store, decryptor);
      console.log("login(): EventStoreWriter.start()");
      await eventStoreWriter.start();
      console.log("login(): storing data");
      this.keypair = keypair;
      this.store = store;
      this.eventStoreWriter = eventStoreWriter;
      console.log("this.keypair:" + this.keypair);
      this.listenForBlocks();
      this.dispatchTypedEvent("loggedIn", new Event("loggedIn"));
    } catch (err) {
      throw new Error("LOGIN_FAILURE");
    }
  }

  private listenForBlocks() {
    const { provider } = this.signer;
    if (!provider) {
      throw new Error("CANNOT_LISTEN_WITHOUT_PROVIDER");
    }

    const blockHandler = (blockHeight: number) => {
      this.dispatchTypedEvent("block", new BlockEvent(blockHeight));
    };

    provider.on("block", blockHandler);
    this.unsubscribeBlocks = () => {
      provider.off("block", blockHandler);
    };
  }

  private async getEthAddress() {
    return this.signer.getAddress();
  }

  private async getLocalOrSignedKeypair() {
    let keypair = await this.getKeypairFromLocalDb();
    if (keypair) return keypair;

    return await this.getKeypairFromSigner();
  }

  async getDb() {
    return EncryptedDb.create(this.encryptor, this.chainId);
  }

  async getKeypairFromLocalDb() {
    const db = await this.getDb();
    return await new AccountStore(db).getKeypair(await this.getEthAddress());
  }

  private async getKeypairFromSigner() {
    return await Keypair.fromSigner(this.signer);
  }

  private getEventStoreWriter() {
    if (this.eventStoreWriter) return this.eventStoreWriter;
    throw new Error("USER_NOT_LOGGED_IN");
  }

  private getStore() {
    if (!this.store) throw new Error("STORE_NOT_CREATED_YET");
    return this.store;
  }

  getKeypair() {
    if (this.keypair) {
      return this.keypair;
    }
    console.log("User not logged in");
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

  async getBlocklist() {
    if (!this.blocklist) throw new Error("NO_BLOCKLIST_CONTRACT");
    return await buildBlocklistMerkleTree(this.blocklist);
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
      transactData: "0x00",
    },
    checkBlocklist = false
  ) {
    console.log("proveShield", JSON.stringify({ amount, asset, swapParams }));
    return await this.getProver().shield(
      amount,
      asset,
      swapParams,
      checkBlocklist
    );
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
      transactData: "0x00",
    },
    checkBlocklist = false
  ) {
    console.log(
      "proveUnshield",
      JSON.stringify({ amount, recipient, asset, swapParams })
    );
    return await this.getProver().unshield(
      amount,
      recipient,
      asset,
      swapParams,
      checkBlocklist
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
      transactData: "0x00",
    },
    checkBlocklist = false
  ) {
    return await this.getProver().transfer(
      amount,
      toPubkey,
      asset,
      swapParams,
      checkBlocklist
    );
  }

  private getProver() {
    if (this.prover) return this.prover;
    this.prover = new ShieldedPoolProver(this, this.proofGen);
    return this.prover;
  }

  async logout() {
    this.unsubscribeBlocks();
    await this.getEventStoreWriter().stop();
    this.dispatchTypedEvent("loggedOut", new Event("loggedOut"));
  }

  static async create(
    contract: ethers.Contract,
    signer: ethers.Signer,
    password: string,
    chainId: number = 1,
    proofGen: GenerateProofFn = generateGroth16Proof,
    blocklist: ethers.Contract | null = null
  ): Promise<Account> {
    // Ensure password length > 16
    const encryptor = PasswordEncryptor.fromPassword(password);
    return new Account(
      contract,
      signer,
      encryptor,
      chainId,
      proofGen,
      blocklist
    );
  }

  // static async localAccountExists() {
  //   return await AccountStore.hasStoredKeypair();
  // }
}
