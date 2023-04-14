import { BigNumber, Contract, providers } from "ethers";
import { ZrcProof } from "./getProof";
import { prepareTransaction } from "./prepareTransaction";
import { Utxo, UtxoStore } from ".";
import { Keypair } from "./keypair";

export class Account {
  constructor(
    private keypair: Keypair,
    private utxoStore: UtxoStore = UtxoStore.create()
  ) {}

  getKeypair() {
    return this.keypair;
  }

  async getUtxosUpTo(amount: number) {
    return await this.utxoStore.getUtxosUpTo(amount);
  }

  fromKeypair(keypair: Keypair) {
    return new Account(keypair);
  }
}

export class Zrc20 {
  constructor(private account: Account) {}

  async mint(amount: number, recipient: string): Promise<ZrcProof> {
    const deposit = new Utxo({ amount, keypair: this.account.getKeypair() });
    const proof = await prepareTransaction({
      outputs: [deposit],
      recipient,
    });
    return proof;
  }

  async transfer(amount: number, recipient: string): Promise<ZrcProof> {
    const inputs = await this.account.getUtxosUpTo(amount);
    const inputsTotal = inputs.reduce(
      (sum, x) => sum.add(x.amount),
      BigNumber.from(0)
    );

    const toSend = new Utxo({
      amount: BigNumber.from(amount),
      keypair: Keypair.fromString(recipient),
    });

    const change = new Utxo({
      amount: BigNumber.from(amount).sub(inputsTotal),
    });

    const proof = await prepareTransaction({
      inputs,
      outputs: [toSend, change],
      recipient,
    });

    return proof;
  }

  async burn(amount: number, recipient: string): Promise<ZrcProof> {
    const inputs = await this.account.getUtxosUpTo(amount);

    const inputsTotal = inputs.reduce(
      (sum, x) => sum.add(x.amount),
      BigNumber.from(0)
    );

    const change = new Utxo({
      amount: BigNumber.from(amount).sub(inputsTotal),
    });

    const outputs = [change];

    const proof = await prepareTransaction({
      inputs,
      outputs,
      recipient,
    });

    return proof;
  }
}
