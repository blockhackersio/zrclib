import { ContractType, getContract } from "@/contracts/get_contract";
import { ethers } from "ethers";
import { useMemo } from "react";

export function useTokenContract(
  token: ContractType | undefined,
  chainId: number,
  signer: ethers.Signer | undefined
) {
  return useMemo(() => {
    if (!token || !signer) return;

    return getContract(token, chainId, signer);
  }, [token, chainId, signer]);
}
