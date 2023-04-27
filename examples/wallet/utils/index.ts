import { DECIMALS } from "@/config/constants";
import { BigNumber, BigNumberish } from "ethers";
/// it's late... don't ask...
export function formatAmount(amount: BigNumberish) {
  return (
    Number(BigNumber.from(amount).mul(1_000000000).toBigInt() / DECIMALS) /
    1_000000000
  )
    .toFixed(6)
    .toString();
}
export function fromNumberInput(amount: number | string) {
  return BigNumber.from(Number(amount) * 1_000000000)
    .mul(DECIMALS)
    .div(1_000000000);
}
