import { BigNumber } from "ethers";
import { prepareTransaction } from "./prepare_transaction";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { ShieldedAccount } from "./shielded_account";
import { ensurePoseidon } from "./poseidon";
import { FormattedProof } from "./types";

export class ShieldedPoolProver {
  constructor(private account: ShieldedAccount) {}

  /**
   * Generate a proof to add tokens to the shielded pool
   *
   * @param amount
   * @returns
   */
  async shield(amount: number | BigNumber): Promise<FormattedProof> {
    await ensurePoseidon();

    const deposit = this.account.createUtxo(amount);
    const proof = await prepareTransaction({
      outputs: [deposit],
      tree: await this.account.getTree(),
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
      amount: inputsTotal.sub(amount),
      keypair: this.account.getKeypair(),
    });
    console.log({ inputs, inputsTotal, toSend, change });

    const proof = await prepareTransaction({
      inputs,
      outputs: [toSend, change],
      tree: await this.account.getTree(),
    });

    return proof;
  }

  /**
   * Generate a proof to remove tokens in the shielded pool
   *
   * @param amount The amount
   * @param recipientEthAddress the recippient address to burn in the proof to ensure the funds cannot be withdrawn elsewhere
   * @returns
   */
  async unshield(
    amount: number | BigNumber,
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
      tree: await this.account.getTree(),
    });

    return proof;
  }
}

export class ShieldedPool {
  static getProver(account: ShieldedAccount): ShieldedPoolProver {
    return new ShieldedPoolProver(account);
  }
}
