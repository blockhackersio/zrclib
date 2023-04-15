import { Account, Keypair, Zrc20, toFixedHex } from "@zrclib/tools";

export async function prepareTx(depositAmount: number, _address: string) {
  const keypair = await Keypair.generate();
  const account = new Account(keypair);
  const zrc20 = new Zrc20(account);

  const { args, extData } = await zrc20.mint(depositAmount);
  return { args, extData, toFixedHex };
}
