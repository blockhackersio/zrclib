import { Contract, Signer } from "ethers";
import addresses from "./addresses.json";
import ERC20_JSON from "./MockErc20.json";
import MASP_JSON from "./MultiAssetShieldedPool.json";
import SWAPROUTER_JSON from "./MockSwapRouter.json";
import SWAPEXEC_JSON from "./SwapExecutor.json";

export type Tokens = "LUSD" | "DAI";
export type ContractType = "SWAPROUTER" | "MASP" | "SWAPEXEC" | Tokens;
export type ChainName = keyof typeof addresses;

const chainLookup: Record<number, ChainName> = {
  1: "mainnet",
  31337: "localnet",
};

export function getChainName(chainId: number) {
  const chainName: ChainName = chainLookup[chainId];
  return chainName;
}

export function getAddress(chainName: ChainName, type: ContractType) {
  return addresses[chainName][type];
}

export function getContract(
  type: ContractType,
  chainId: number,
  provider: Signer
) {
  const chainName = getChainName(chainId);

  switch (type) {
    case "MASP": {
      const address = getAddress(chainName, "MASP");
      return new Contract(address, MASP_JSON.abi, provider);
    }
    case "SWAPEXEC": {
      const address = getAddress(chainName, "SWAPEXEC");
      return new Contract(address, SWAPEXEC_JSON.abi, provider);
    }
    case "SWAPROUTER": {
      const address = getAddress(chainName, "SWAPROUTER");
      return new Contract(address, SWAPROUTER_JSON.abi, provider);
    }
    case "LUSD": {
      const abi = ERC20_JSON.abi;
      const address = getAddress(chainName, "LUSD");
      return new Contract(address, abi, provider);
    }
    case "DAI": {
      const abi = ERC20_JSON.abi;
      const address = getAddress(chainName, "DAI");
      return new Contract(address, abi, provider);
    }
    default:
      throw new Error("UNKNOWN_CONTRACT_TYPE");
  }
}

export function getTokens(): Tokens[] {
  return ["DAI", "LUSD"];
}

export function getAssets(chainId: number): `0x${string}`[] {
  const chainName = getChainName(chainId);

  const tokens = getTokens();

  return tokens.map((token) => {
    return addresses[chainName][token] as `0x${string}`;
  });
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
