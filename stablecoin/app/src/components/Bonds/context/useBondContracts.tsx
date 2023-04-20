import { Decimal } from "@liquity/lib-base";
import { ZUSD } from "../../../../../typechain-types/contracts/ZUSD";
import ZUSDTokenAbi from "./ZUSD.json"
import { useContract } from "../../../hooks/useContract";
import type { Addresses } from "./transitions";
import { useWeb3React } from "@web3-react/core";
import { useBondAddresses } from "./BondAddressesContext";

type ShieldedPoolContracts = {
  addresses: Addresses;
  zusdToken: ZUSD | undefined;
};

export const useShieldedPoolContracts = (): ShieldedPoolContracts  => {
  const { chainId } = useWeb3React();
  const isMainnet = chainId === 1;

  const addresses = useBondAddresses();

  const {
    ZUSD_ADDRESS,
  } = addresses;

  const [zusdTokenDefault, zusdTokenDefaultStatus] = useContract<ZUSD>(
    ZUSD_ADDRESS,
    ZUSDTokenAbi.abi
  );

  return {
    addresses,
    zusdToken: zusdTokenDefault,
  };
};
