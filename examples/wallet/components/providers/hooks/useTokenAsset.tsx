import { ContractType, getTokenFromAddress } from "@/contracts/get_contract";
import { useState } from "react";

export function useTokenAsset(chainId: number) {
  const [asset, setAsset] = useState<string | undefined>();
  const token = asset
    ? (getTokenFromAddress(asset, chainId) as ContractType)
    : undefined;
  return { asset, token, setAsset };
}
