import { DECIMALS } from "@/config/constants";
import { BigNumber, BigNumberish } from "ethers";
export function formatAmount(amount: BigNumberish) {
  return (BigNumber.from(amount).toNumber() / DECIMALS).toFixed(6).toString();
}
