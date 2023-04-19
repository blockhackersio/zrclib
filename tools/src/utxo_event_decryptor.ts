import { Contract, EventFilter, ethers, providers } from "ethers";
import { NewCommitment, NewNullifier, Store } from "./types";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";

function toNewCommitment(args: any): NewCommitment {
  return {
    type: "NewCommitment",
    commitment: args.commitment,
    index: args.index,
    encryptedOutput: args.encryptedOutput,
  };
}

function toNullifierOrCommitment(args: any): NewCommitment | NewNullifier {
  if (args.commitment) {
    return toNewCommitment(args);
  }
  return toNewNullifier(args);
}

function toNewNullifier(args: any): NewNullifier {
  return {
    type: "NewNullifier",
    nullifier: args.nullifier,
  };
}
type UnsubscribeFn = () => void;
function subscribeToContractEvents<T>(
  contractAddress: string,
  fromBlock: number,
  eventFilter: EventFilter,
  eventParser: (event: { args?: any }) => T,
  callback: (event: T, blockheight: number) => void | Promise<void>
): UnsubscribeFn {
  const provider = ethers.getDefaultProvider();
  const contract = new Contract(contractAddress, [], provider);

  contract
    .queryFilter(eventFilter, fromBlock)
    .then(async (historicalEvents) => {
      for (const event of historicalEvents) {
        await callback(eventParser((event as any).args), event.blockNumber);
      }
    });

  const handler = (event: any) => {
    callback(eventParser(event.args), event.blockNumber);
  };

  const eventEmitter = contract.on(eventFilter, handler);

  return () => {
    eventEmitter.off(eventFilter, handler);
  };
}

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

  constructor(private address: string, private keypair: Keypair) {}

  public start(
    lastBlock = 0,
    _subscribeToContractEvents = subscribeToContractEvents
  ) {
    this._isStarted = true;
    const self = this;
    async function handleEvent(
      event: NewCommitment | NewNullifier,
      blockheight: number
    ) {
      if (event.type === "NewNullifier") {
        await self.handleNullifier(event.nullifier, blockheight);
        return;
      }
      if (event.type === "NewCommitment") {
        const utxo = attemptUtxoDecryption(self.keypair, event);
        if (utxo) await self.handleUtxo(utxo, blockheight);
        return;
      }
      throw new Error("Unknown event");
    }

    this.unsubscribe = _subscribeToContractEvents(
      this.address,
      lastBlock,
      {
        topics: [
          ethers.utils.id("NewCommitment(bytes32,uint256,bytes)"),
          ethers.utils.id("NewNullifier(bytes32)"),
        ],
      },
      toNullifierOrCommitment,
      handleEvent
    );
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
