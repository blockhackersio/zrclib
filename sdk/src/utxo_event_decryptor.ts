import { ethers } from "ethers";
import { NewCommitment } from "./types";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";

[
  "event NewCommitment(bytes32 indexed commitment, uint256 indexed index, bytes indexed encryptedOutput)",
  "event NewNullifier(bytes32 indexed nullifier)",
];

type UnsubscribeFn = () => void;

function attemptUtxoDecryption(
  keypair: Keypair,
  event: NewCommitment
): Utxo | null {
  try {
    return Utxo.decrypt(keypair, event.encryptedOutput, event.index);
  } catch (_err) {
    return null;
  }
}

type UtxoHandler = (utxo: Utxo, blockheight: number) => void | Promise<void>;
type NullifierHandler = (
  nullifier: string,
  blockheight: number
) => void | Promise<void>;

export class UtxoEventDecryptor {
  private _isStarted: boolean = false;
  private unsubscribe: UnsubscribeFn = () => {};
  private handleUtxo: UtxoHandler = () => {};
  private handleNullifier: NullifierHandler = () => {};

  constructor(private contract: ethers.Contract, private keypair: Keypair) {}

  public async start(lastBlock = 0 /* will use this later */) {
    this._isStarted = true;

    const commitmentHandler = (
      commitment: string,
      index: ethers.BigNumber,
      encryptedOutput: string,
      event: ethers.Event
    ) => {
      console.log("=== commitmentHandler ===");
      const utxo = attemptUtxoDecryption(this.keypair, {
        type: "NewCommitment",
        commitment,
        index: index.toNumber(),
        encryptedOutput,
      });
      if (utxo) {
        console.log(
          `Received Utxo {amount:${utxo.amount},asset:${utxo.asset},pubkey:${utxo.keypair.pubkey},${utxo.blinding}}`
        );
        this.handleUtxo(utxo, event.blockNumber);
      }
    };
    const nullifierHandler = async (nullifier: string, event: ethers.Event) => {
      console.log("=== nullifierHandler ===");

      console.log(`Received Nullifier ${nullifier}`);
      await this.handleNullifier(nullifier, event.blockNumber);
    };

    const nullifierFilter = this.contract.filters.NewNullifier();
    const nullifierEvents = await this.contract.queryFilter(nullifierFilter, 0);
    const commitmentFilter = this.contract.filters.NewCommitment();
    const commitmentEvents = await this.contract.queryFilter(
      commitmentFilter,
      0
    );

    for (let event of nullifierEvents) {
      // @ts-ignore-line
      await nullifierHandler(event.args.nullifier, event.blockNumber);
    }

    for (let event of commitmentEvents) {
      commitmentHandler(
        // @ts-ignore-line
        event.args.commitment,
        // @ts-ignore-line
        event.args.index,
        // @ts-ignore-line
        event.args.encryptedOutput,
        // @ts-ignore-line
        event
      );
    }

    this.contract.on("NewCommitment", commitmentHandler);
    this.contract.on("NewNullifier", nullifierHandler);

    this.unsubscribe = () => {
      this.contract.off("NewCommitment", commitmentHandler);
      this.contract.off("NewNullifier", nullifierHandler);
    };
  }

  public onUtxo(handler: UtxoHandler) {
    console.log("onUtxo registering handler ");
    this.handleUtxo = handler;
  }
  public onNullifier(handler: NullifierHandler) {
    console.log("onNullifier registering handler ");
    this.handleNullifier = handler;
  }

  public stop() {
    if (this._isStarted) this.unsubscribe();
    this._isStarted = false;
  }

  public isStarted() {
    return this._isStarted;
  }
}
