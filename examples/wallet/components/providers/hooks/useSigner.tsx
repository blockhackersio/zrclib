import { useEffect, useState } from "react";
import { Connector } from "wagmi";
import { ethers } from "ethers";

export function useSigner(connector: Connector<any, any, any> | undefined) {
  const [signer, setSigner] = useState<ethers.Signer>();
  useEffect(() => {
    if (!connector) return;
    connector.getSigner().then(setSigner);
  }, [connector]);
  return signer;
}
