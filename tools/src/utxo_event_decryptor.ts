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
    console.log(_err);
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

  public start(lastBlock = 0 /* will use this later */) {
    this._isStarted = true;

    const commitmentHandler = (
      commitment: string,
      index: ethers.BigNumber,
      encryptedOutput: string,
      event: ethers.Event
    ) => {
      const utxo = attemptUtxoDecryption(this.keypair, {
        type: "NewCommitment",
        commitment,
        index: index.toNumber(),
        encryptedOutput,
      });
      if (utxo) this.handleUtxo(utxo, event.blockNumber);
    };
    const nullifierHandler = async (nullifier: string, event: ethers.Event) => {
      await this.handleNullifier(nullifier, event.blockNumber);
    };
    this.contract.on("NewCommitment", commitmentHandler);
    this.contract.on("NewNullifier", nullifierHandler);

    this.unsubscribe = () => {
      this.contract.off("NewCommitment", commitmentHandler);
      this.contract.off("NewNullifier", nullifierHandler);
    };
  }

  public onUtxo(handler: UtxoHandler) {
    this.handleUtxo = handler;
  }
  public onNullifier(handler: NullifierHandler) {
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
