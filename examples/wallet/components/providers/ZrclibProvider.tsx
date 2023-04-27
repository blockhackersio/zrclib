import {
  Tokens,
  getContract,
  getTokenFromAddress,
} from "@/contracts/get_contract";
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
import { BigNumber, Signer } from "ethers";
import { MockErc20 } from "@/../../tests/typechain-types";
import { FormattedProof } from "@zrclib/sdk/src/types";
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
  faucet(amount: BigNumber): Promise<void>;
  approve(amount: BigNumber): Promise<void>;
  proveShield(amount: BigNumber): Promise<FormattedProof>;
  proveUnshield(amount: BigNumber, recipient: string): Promise<FormattedProof>;
  proveTransfer(amount: BigNumber, toPubKey: string): Promise<FormattedProof>;
  setAsset(asset?: string): void;
  send(proof: FormattedProof): Promise<void>;
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
  async proveShield() {
    throw new Error("not ready");
  },
  async proveTransfer() {
    throw new Error("not ready");
  },
  async faucet() {},
  async approve() {},
  async proveUnshield() {
    throw new Error("not ready");
  },
  async send() {
    throw new Error("not ready");
  },
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

  const faucet = useCallback(
    async (amount: BigNumber) => {
      console.log(`faucet: ${amount}`);

      if (!connector) return;
      if (typeof asset === "undefined") return;
      if (typeof chainId === "undefined") return;

      const signer: Signer = await connector.getSigner();
      const type = getTokenFromAddress(asset, chainId) as Tokens;
      const contract = getContract(type, chainId, signer) as MockErc20;

      const tx = await contract.mint(await signer.getAddress(), amount);
      await tx.wait();
    },
    [asset, chainId, connector]
  );

  const send = useCallback(
    async (proof: FormattedProof) => {
      console.log(`proveShield: ${JSON.stringify(proof)}`);

      if (!connector) return;
      if (typeof asset === "undefined") return;
      if (typeof chainId === "undefined") return;

      const signer: Signer = await connector.getSigner();
      const contract = getContract("MASP", chainId, signer);

      const tx = await contract.transact(proof);
      await tx.wait();
    },
    [asset, chainId, connector]
  );

  const proveShield = useCallback(
    async (amount: BigNumber) => {
      console.log(`proveShield: ${amount}`);

      if (!connector) throw new Error("");
      if (typeof asset === "undefined") throw new Error("");

      const proof = await zrclib.proveShield(amount, BigNumber.from(asset));
      return proof;
    },
    [asset, connector]
  );

  const proveUnshield = useCallback(
    async (amount: BigNumber, recipient: string) => {
      console.log(`proveUnshield: ${amount}`);

      if (!connector) throw new Error("");
      if (typeof asset === "undefined") throw new Error("");

      const proof = await zrclib.proveUnshield(
        amount,
        recipient,
        BigNumber.from(asset)
      );
      return proof;
    },
    [asset, connector]
  );

  const proveTransfer = useCallback(
    async (amount: BigNumber, toPubKey: string) => {
      console.log(`proveTransfer: ${amount}`);

      if (!connector) throw new Error("");
      if (typeof asset === "undefined") throw new Error("");

      const proof = await zrclib.proveTransfer(
        amount,
        toPubKey,
        BigNumber.from(asset)
      );
      return proof;
    },
    [asset, connector]
  );

  const approve = useCallback(
    async (amount: BigNumber) => {
      console.log(`approve: ${amount}`);
      if (!connector) throw new Error("connector now found");
      if (typeof asset === "undefined") throw new Error("asset not found");
      if (typeof chainId === "undefined") throw new Error("chainid not found");

      const signer: Signer = await connector.getSigner();
      const type = getTokenFromAddress(asset, chainId) as Tokens;

      const spender = getContract("MASP", chainId, signer);
      const contract = getContract(type, chainId, signer) as MockErc20;

      const tx = await contract.approve(spender.address, amount);
      await tx.wait();
    },
    [chainId, asset, connector]
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
      faucet,
      proveShield,
      proveUnshield,
      proveTransfer,
      send,
      approve,
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
    faucet,
    proveShield,
    proveUnshield,
    proveTransfer,
    send,
    approve,
  ]);
  return (
    <ZrclibContext.Provider value={api}>{p.children}</ZrclibContext.Provider>
  );
}

export function useZrclib() {
  return useContext(ZrclibContext);
}
