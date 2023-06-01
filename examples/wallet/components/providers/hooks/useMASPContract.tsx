import { getContract } from "@/contracts/get_contract";
import { useMemo } from "react";
import { ethers } from "ethers";

export function useMASPContract(chainId: number, signer?: ethers.Signer) {
  return useMemo(() => {
    console.log("Regenerating MASP contract");
    if (!signer) return;
    return getContract("MASP", chainId, signer);
  }, [chainId, signer]);
}
