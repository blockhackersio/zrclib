import { BigNumber } from "ethers";
import { prepareTransaction } from "./prepare_transaction";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { Account } from "./account";
import { ensurePoseidon } from "./poseidon";
import { FormattedProof } from "./types";

export class ShieldedPool {
  constructor(private account: Account) {}

  async mint(amount: number): Promise<FormattedProof> {
    await ensurePoseidon();
    const deposit = new Utxo({ amount, keypair: this.account.getKeypair() });
    const proof = await prepareTransaction({
      outputs: [deposit],
    });
    return proof;
  }

  /**
   * Generate a proof to transfer tokens in the shielded pool
   *
   * @param amount
   * @param toPubKey Keypair public key to send the note to
   * @returns
   */
  async transfer(amount: number, toPubKey: string): Promise<FormattedProof> {
    await ensurePoseidon();
    const inputs = await this.account.getUtxosUpTo(amount);
    const inputsTotal = inputs.reduce(
      (sum, x) => sum.add(x.amount),
      BigNumber.from(0)
    );

    const toSend = new Utxo({
      amount: BigNumber.from(amount),
      keypair: Keypair.fromString(toPubKey),
    });

    const change = new Utxo({
      amount: BigNumber.from(amount).sub(inputsTotal),
    });

    const proof = await prepareTransaction({
      inputs,
      outputs: [toSend, change],
    });

    return proof;
  }

  /**
   * Generate a proof to burn tokens in the shielded pool
   *
   * @param amount The amount
   * @param recipientEthAddress the recippient address to burn in the proof to ensure the funds cannot be withdrawn elsewhere
   * @returns
   */
  async burn(
    amount: number,
    recipientEthAddress: string
  ): Promise<FormattedProof> {
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
      recipient: recipientEthAddress,
    });

    return proof;
  }
}
