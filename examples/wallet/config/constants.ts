export type Tokens = "LUSD" | "DAI";
export const availableTokens: Tokens[] = ["LUSD", "DAI"];
export const validEthAddress = /^0x[a-fA-F0-9]{40}$/;
export const DECIMALS = 1_000000000000000000n;

export function isToken(value: any): value is Tokens {
  console.log("isToken", value);
  return availableTokens.includes(value);
}
