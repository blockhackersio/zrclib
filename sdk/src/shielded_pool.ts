import { BigNumber, BigNumberish } from "ethers";
import { prepareTransaction } from "./prepare_transaction";
import { Utxo } from "./utxo";
import { Keypair } from "./keypair";
import { Account } from "./account";
import { ensurePoseidon } from "./poseidon";
import { FormattedProof, SwapParams } from "./types";
import { GenerateProofFn } from "./generate_proof";

export class ShieldedPoolProver {
  constructor(private account: Account, private proofGen: GenerateProofFn) {}

  /**
   * Generate a proof to add tokens to the shielded pool
   *
   * @param amount
   * @returns
   */
  async shield(
    amount: BigNumberish,
    asset: BigNumberish = 0,
    swapParams: SwapParams = {
      tokenOut: BigNumber.from(0),
      amountOutMin: BigNumber.from(0),
      swapRecipient: BigNumber.from(0),
      swapRouter: BigNumber.from(0),
      swapData: BigNumber.from(0),
      transactData: BigNumber.from(0),
    }
  ): Promise<FormattedProof> {
    await ensurePoseidon();

    const deposit = this.account.createUtxo(amount, asset);
    // console.log("after utxo");
    const proof = await prepareTransaction({
      asset: BigNumber.from(asset),
      outputs: [deposit],
      swapParams: swapParams,
      tree: await this.account.getTree(),
      proofGen: this.proofGen,
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
  async transfer(
    amount: BigNumberish,
    toPubKey: string,
    asset: BigNumberish = 0,
    swapParams: SwapParams = {
      tokenOut: BigNumber.from(0),
      amountOutMin: BigNumber.from(0),
      swapRecipient: BigNumber.from(0),
      swapRouter: BigNumber.from(0),
      swapData: BigNumber.from(0),
      transactData: BigNumber.from(0),
    }
  ): Promise<FormattedProof> {
    await ensurePoseidon();
    const inputs = await this.account.getUtxosUpTo(amount, asset);
    const inputsTotal = inputs.reduce(
      (sum, x) => sum.add(x.amount),
      BigNumber.from(0)
    );

    const toSend = new Utxo({
      asset: BigNumber.from(asset),
      amount: BigNumber.from(amount),
      keypair: Keypair.fromString(toPubKey),
    });

    const change = new Utxo({
      asset: BigNumber.from(asset),
      amount: inputsTotal.sub(amount),
      keypair: this.account.getKeypair(),
    });

    const proof = await prepareTransaction({
      asset: BigNumber.from(asset),
      inputs,
      outputs: [toSend, change],
      swapParams: swapParams,
      tree: await this.account.getTree(),
      proofGen: this.proofGen,
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
    amount: BigNumberish,
    recipientEthAddress: string,
    asset: BigNumberish = 0,
    swapParams: SwapParams = {
      tokenOut: BigNumber.from(0),
      amountOutMin: BigNumber.from(0),
      swapRecipient: BigNumber.from(0),
      swapRouter: BigNumber.from(0),
      swapData: BigNumber.from(0),
      transactData: BigNumber.from(0),
    }
  ): Promise<FormattedProof> {
    await ensurePoseidon();
    const inputs = await this.account.getUtxosUpTo(amount, asset);

    const inputsTotal = inputs.reduce(
      (sum, x) => sum.add(x.amount),
      BigNumber.from(0)
    );

    const change = new Utxo({
      asset: BigNumber.from(asset),
      amount: BigNumber.from(inputsTotal).sub(amount),
    });

    const outputs = [change];

    const proof = await prepareTransaction({
      asset: BigNumber.from(asset),
      inputs,
      outputs,
      recipient: recipientEthAddress,
      swapParams: swapParams,
      tree: await this.account.getTree(),
      proofGen: this.proofGen,
    });

    return proof;
  }
}

export class ShieldedPool {
  static getProver(
    account: Account,
    proofGen: GenerateProofFn
  ): ShieldedPoolProver {
    return new ShieldedPoolProver(account, proofGen);
  }
}
