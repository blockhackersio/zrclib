import { BigNumber, Contract, providers } from "ethers";
import { ZrcProof } from "./get_proof";
import { prepareTransaction } from "./prepare_transaction";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { Account } from "./account";
import { ensurePoseidon } from "./poseidon";

export class Zrc20 {
  constructor(private account: Account) {}

  async mint(amount: number, recipient?: string): Promise<ZrcProof> {
    await ensurePoseidon();
    const deposit = new Utxo({ amount, keypair: this.account.getKeypair() });
    const proof = await prepareTransaction({
      outputs: [deposit],
      recipient,
    });
    return proof;
  }

  async transfer(amount: number, recipient: string): Promise<ZrcProof> {
    await ensurePoseidon();
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
    await ensurePoseidon();
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
