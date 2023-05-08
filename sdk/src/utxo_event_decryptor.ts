import { BigNumber, ethers } from "ethers";
import { NewCommitment } from "./types";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { simpleHash } from "fixed-merkle-tree";
type UnsubscribeFn = () => Promise<void>;

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

class ResolvablePromise<T> {
  private _promise: Promise<T>;
  private _resolve = (v: T) => {};
  constructor() {
    this._promise = this.resetPromise();
  }

  private resetPromise() {
    return new Promise<T>((resolve) => {
      this._resolve = resolve;
    });
  }
  resolve(v: T) {
    this._resolve(v);
    this._promise = this.resetPromise();
  }

  promise() {
    return this._promise;
  }
}

class TaskQueue {
  public queue: (() => Promise<void>)[] = [];
  public activePromise: Promise<void> | null = null;
  private waitForTasks: ResolvablePromise<void> = new ResolvablePromise();

  public add(task: () => Promise<void>): void {
    console.log("adding task: ", task);
    this.queue.push(task);
    this.runTasks();
  }

  public async wait(): Promise<void> {
    await this.waitForTasks.promise();
  }

  private async runTasks(): Promise<void> {
    if (!this.activePromise) {
      while (this.queue.length > 0) {
        const task = this.queue.shift()!;
        this.activePromise = task().finally(() => {
          this.activePromise = null;
          this.runTasks();
        });
      }

      // Throw resolution to next tick
      await new Promise((r) => setTimeout(r, 1000));
      this.waitForTasks.resolve();
    }
  }
}

function hashEvent(event: ethers.Event) {
  return simpleHash([JSON.stringify(event)]);
}

type EthersNullifierEvent = ethers.Event & {
  args: {
    nullifier: string;
  };
};

type EthersCommitmentEvent = ethers.Event & {
  args: {
    commitment: string;
    index: BigNumber;
    encryptedOutput: string;
  };
};
function isNullifierEvent(v: any): v is EthersNullifierEvent {
  return typeof v.args.nullifier === "string";
}

function isCommitmentEvent(v: any): v is EthersCommitmentEvent {
  return typeof v.args.commitment === "string";
}

export class UtxoEventDecryptor {
  private _isStarted: boolean = false;
  private unsubscribe: UnsubscribeFn = () => Promise.resolve();
  private handleUtxo: UtxoHandler = () => {};
  private handleNullifier: NullifierHandler = () => {};
  private cache = new Set<string>();
  private tasks = new TaskQueue();

  constructor(private contract: ethers.Contract, private keypair: Keypair) {}

  public async start(lastBlock = 0 /* will use this later */) {
    this._isStarted = true;

    const commitmentHandler = async (
      commitment: string,
      index: ethers.BigNumber,
      encryptedOutput: string,
      event: ethers.Event
    ) => {
      console.log("=commitmentHandler=");
      this.runIfUniqueEvent(event, async () => {
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
      });
    };
    const nullifierHandler = async (nullifier: string, event: ethers.Event) => {
      console.log("=nullifierHandler=");
      this.runIfUniqueEvent(event, async () => {
        await this.handleNullifier(nullifier, event.blockNumber);
      });
    };

    const nullifierFilter = this.contract.filters.NewNullifier();
    const nullifierEvents = await this.contract.queryFilter(nullifierFilter, 0);
    const commitmentFilter = this.contract.filters.NewCommitment();
    const commitmentEvents = await this.contract.queryFilter(
      commitmentFilter,
      0
    );

    for (let event of nullifierEvents) {
      if (!isNullifierEvent(event)) throw new Error("BAD_EVENT_FORMAT");
      console.log(
        "Processing historical nullifierEvent: " + event.args.nullifier
      );
      await nullifierHandler(event.args.nullifier, event);
    }

    for (let event of commitmentEvents) {
      if (!isCommitmentEvent(event)) throw new Error("BAD_EVENT_FORMAT");
      console.log(
        "Processing historical commitmentEvent: " + event.args.commitment
      );
      await commitmentHandler(
        event.args.commitment,
        event.args.index,
        event.args.encryptedOutput,
        event
      );
    }

    console.log("starting listeners");
    this.contract.on("NewCommitment", commitmentHandler);
    this.contract.on("NewNullifier", nullifierHandler);

    this.unsubscribe = async () => {
      await this.tasks.wait();
      this.contract.off("NewCommitment", commitmentHandler);
      this.contract.off("NewNullifier", nullifierHandler);
      this.cache = new Set();
      this.tasks = new TaskQueue();
    };
  }

  public onUtxo(handler: UtxoHandler) {
    // console.log("onUtxo registering handler ");
    this.handleUtxo = handler;
  }
  public onNullifier(handler: NullifierHandler) {
    // console.log("onNullifier registering handler ");
    this.handleNullifier = handler;
  }

  private runIfUniqueEvent(event: ethers.Event, task: () => Promise<void>) {
    console.log("runIfUniqueEvent");
    const hash = hashEvent(event);
    console.log({ hash });
    if (this.cache.has(hash)) {
      console.log("Rejecting because event has already been seen");
      return;
    }
    console.log("cache miss running fn");
    this.cache.add(hash);
    this.tasks.add(task);
  }

  waitForAllHandlers() {
    console.log(this.tasks.queue.length);
    return this.tasks.wait();
  }

  public async stop() {
    if (this._isStarted) return this.unsubscribe();
    this._isStarted = false;
  }

  public isStarted() {
    return this._isStarted;
  }
}
