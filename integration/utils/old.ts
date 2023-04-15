// @ts-ignore-line
import Utxo from "./utxo";
// @ts-ignore-line
import { Keypair } from "./keypair";
// @ts-ignore-line
import { prepareTransaction } from "./index";
// @ts-ignore-line
import { toFixedHex } from "./utils";
export async function prepareTx(depositAmount: number, address: string) {
  const keypair = await Keypair.create();
  const deposit = new Utxo({ amount: depositAmount, keypair: keypair });

  const { args, extData } = await prepareTransaction({
    outputs: [deposit],
    account: {
      owner: address,
      publicKey: deposit.keypair.address(),
    },
  });
  return {
    args,
    extData,
    toFixedHex,
  };
}
