import { getContract } from "@/contracts/get_contract";
import { AccountBalances, ZrclibAccount } from "@/services/zrclib";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAccount } from "wagmi";
import { Signer } from "ethers";
const zrclib = ZrclibAccount.getInstance();

type ZrcApi = {
  block: number;
  loggedIn: boolean;
  chainId: number;
  asset: string | undefined;
  balances: AccountBalances;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  login(password: string): Promise<void>;
  setAsset(asset: string): void;
};

const defaultLib: ZrcApi = {
  block: 0,
  loggedIn: false,
  chainId: 1,
  asset: undefined,
  balances: { privateBalances: new Map(), publicBalances: new Map() },
  address: undefined,
  isConnected: false,
  setAsset() {},
  async login() {},
};

export const ZrclibContext = createContext<ZrcApi>(defaultLib);

export function ZrclibProvider(p: { children: ReactNode }) {
  const [block, setBlock] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chainId, setChainId] = useState(1);
  const [asset, setAsset] = useState<string | undefined>();
  const [balances, setBalances] = useState<AccountBalances>({
    privateBalances: new Map(),
    publicBalances: new Map(),
  });

  const { address, isConnected, connector } = useAccount({
    onDisconnect: () => {
      zrclib.logout();
      setLoggedIn(false);
    },
  });

  const login = useCallback(
    async (password: string) => {
      if (!connector) throw new Error("CONNECTOR_NOT_AVAILABLE");
      try {
        const signer = (await connector.getSigner()) as Signer;
        const chainId = await connector.getChainId();
        setChainId(chainId);
        const contract = getContract("MASP", chainId, signer as any);
        await zrclib.createAndLogin(contract, signer, password);
        setLoggedIn(true);
        zrclib.onBlock((b) => {
          setBlock(b);
          zrclib.getBalances().then(setBalances);
        });
      } catch (err) {
        console.log(err);
      }
    },
    [connector]
  );

  const api = useMemo(() => {
    return {
      block,
      loggedIn,
      chainId,
      balances,
      address,
      isConnected,
      asset,
      setAsset,
      login,
    };
  }, [
    block,
    setAsset,
    asset,
    loggedIn,
    chainId,
    balances,
    address,
    isConnected,
    login,
  ]);
  return (
    <ZrclibContext.Provider value={api}>{p.children}</ZrclibContext.Provider>
  );
}

export function useZrclib() {
  return useContext(ZrclibContext);
}
