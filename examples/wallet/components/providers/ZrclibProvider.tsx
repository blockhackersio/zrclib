import { ReactNode, createContext, useContext } from "react";
import { useCreateZrclib } from "./hooks/useCreateZrclib";

type ZrcApi = ReturnType<typeof useCreateZrclib>;

async function defaultFn(..._: any[]): Promise<any> {
  throw new Error("not ready");
}

const defaultLib: ZrcApi = {
  accountExists: false,
  address: undefined,
  approve: defaultFn,
  asset: undefined,
  balances: { privateBalances: new Map(), publicBalances: new Map() },
  chainId: 1,
  createAndLogin: defaultFn,
  faucet: defaultFn,
  isConnected: false,
  login: defaultFn,
  loggedIn: false,
  proveShield: defaultFn,
  proveSwapReshield: defaultFn,
  proveSwapUnshield: defaultFn,
  proveTransfer: defaultFn,
  proveUnshield: defaultFn,
  pubkey: undefined,
  publicTransfer: defaultFn,
  send: defaultFn,
  setAsset() {},
  token: undefined,
  transactAndSwap: defaultFn,
};

export const ZrclibContext = createContext<ZrcApi>(defaultLib);

export function ZrclibProvider(p: { children: ReactNode }) {
  const api = useCreateZrclib();
  return (
    <ZrclibContext.Provider value={api}>{p.children}</ZrclibContext.Provider>
  );
}

export function useZrclib() {
  return useContext(ZrclibContext);
}
