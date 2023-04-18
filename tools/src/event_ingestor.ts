import { ethers, providers } from "ethers";
import { NewCommitment, NewNullifier, Store } from "./types";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";

function formNewCommitment(args: ethers.utils.Result): NewCommitment {
  return {
    type: "NewCommitment",
    commitment: args.commitment,
    index: args.index,
    encryptedOutput: args.encryptedOutput,
  };
}

function formNewNullifier(args: ethers.utils.Result): NewNullifier {
  return {
    type: "NewNullifier",
    nullifier: args.nullifier,
  };
}

export class EventIngestor {
  constructor(
    private contract: ethers.Contract,
    private keypair: Keypair,
    private nullifierStore: Store<string>,
    private utxoStore: Store<Utxo>
  ) {}

  public start() {
    const newCommitmentFilter = this.contract.filters.NewCommitment();
    const newNullifierFilter = this.contract.filters.NewNullifier();

    this.contract.provider.on(newCommitmentFilter, async (log) => {
      const event = this.contract.interface.parseLog(log);
      const newCommitment = formNewCommitment(event.args);
      await this.handleNewCommitmentEvent(newCommitment);
    });

    this.contract.provider.on(newNullifierFilter, async (log) => {
      const event = this.contract.interface.parseLog(log);
      const newNullifier = formNewNullifier(event.args);
      await this.handleNewNullifierEvent(newNullifier);
    });
  }

  public stop() {
    this.contract.provider.removeAllListeners();
  }

  private async handleNewCommitmentEvent(
    event: Omit<NewCommitment, "type">
  ): Promise<void> {
    try {
      const decryptedUtxo = Utxo.decrypt(
        this.keypair,
        event.encryptedOutput,
        event.index
      );
      await this.utxoStore.add(event.commitment, decryptedUtxo);
    } catch (error) {
      console.log("Failed to decrypt encryptedOutput:", error);
    }
  }

  private async handleNewNullifierEvent({
    nullifier,
  }: NewNullifier): Promise<void> {
    await this.nullifierStore.add(nullifier, nullifier);
  }
}
