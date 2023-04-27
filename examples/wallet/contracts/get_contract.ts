import { Contract, Signer, ethers, providers } from "ethers";
import MASP_JSON from "./MultiAssetShieldedPool.json";
import ERC20_JSON from "./MockErc20.json";
import addresses from "./addresses.json";

export type Tokens = "LUSD" | "DAI";
export type ContractType = "MASP" | Tokens;
export type ChainName = keyof typeof addresses;

const chainLookup: Record<number, ChainName> = {
  1: "mainnet",
  31337: "localnet",
};

export function getChainName(chainId: number) {
  const chainName: ChainName = chainLookup[chainId];
  return chainName;
}

export function getContract(
  type: ContractType,
  chainId: number,
  provider: Signer
) {
  const chainName = getChainName(chainId);

  switch (type) {
    case "MASP": {
      const { abi } = MASP_JSON;
      const address = addresses[chainName].MASP;
      return new Contract(address, abi, provider);
    }
    case "LUSD": {
      const { abi } = ERC20_JSON;
      const address = addresses[chainName].LUSD;
      return new Contract(address, abi, provider);
    }
    case "DAI": {
      const { abi } = ERC20_JSON;
      const address = addresses[chainName].DAI;
      return new Contract(address, abi, provider);
    }
    default:
      throw new Error("UNKNOWN_CONTRACT_TYPE");
  }
}
export function getTokens(): Tokens[] {
  return ["DAI", "LUSD"];
}
export function getTokenFromAddress(
  address: string,
  chainId: number
): string | undefined {
  const chainName = getChainName(chainId);
  let found: string | undefined;
  for (const [key, value] of Object.entries(addresses[chainName])) {
    if (value === address) {
      found = key;
      break;
    }
  }
  return found;
}
