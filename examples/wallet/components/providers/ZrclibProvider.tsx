import {
  Tokens,
  getAddress,
  getChainName,
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
import { BigNumber, Signer, ethers } from "ethers";
import { MockErc20 } from "@/../../tests/typechain-types";
import { FormattedProof } from "@zrclib/sdk/src/types";
import { tryUntilPasses } from "@/utils";
const zrclib = ZrclibAccount.getInstance();

type ZrcApi = {
  block: number;
  loggedIn: boolean;
  chainId: number;
  token: string | undefined;
  asset: string | undefined;
  balances: AccountBalances;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  login(password: string): Promise<void>;
  faucet(amount: BigNumber): Promise<void>;
  approve(amount: BigNumber): Promise<void>;
  proveShield(amount: BigNumber): Promise<FormattedProof>;
  proveUnshield(amount: BigNumber): Promise<FormattedProof>;
  proveSwapUnshield(
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    tokenAAddress: string,
    tokenBAddress: string,
    reshieldProof: FormattedProof
  ): Promise<FormattedProof>;
  proveSwapReshield(
    amount: BigNumber,
    tokenBAddress: string
  ): Promise<FormattedProof>;
  proveTransfer(amount: BigNumber, toPubKey: string): Promise<FormattedProof>;
  setAsset(asset?: string): void;
  send(proof: FormattedProof): Promise<void>;
  transactAndSwap(proof: FormattedProof): Promise<void>;
};

const defaultLib: ZrcApi = {
  block: 0,
  loggedIn: false,
  chainId: 1,
  asset: undefined,
  balances: { privateBalances: new Map(), publicBalances: new Map() },
  address: undefined,
  isConnected: false,
  token: undefined,
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
  async proveSwapUnshield() {
    throw new Error("not ready");
  },
  async proveSwapReshield() {
    throw new Error("not ready");
  },
  async send() {
    throw new Error("not ready");
  },
  async transactAndSwap() {
    throw new Error("not ready");
  },
};
function encodeData(proof: FormattedProof) {
  console.log("proof: ", proof);
  const abi = new ethers.utils.AbiCoder();
  const encoded = abi.encode(
    [
      "tuple(bytes proof,bytes32 root,bytes32[2] inputNullifiers,bytes32[2] outputCommitments,uint256 publicAmount,address publicAsset,bytes32 extDataHash)",
      "tuple(address recipient,int256 extAmount,bytes encryptedOutput1,bytes encryptedOutput2,address tokenOut,uint256 amountOutMin,address swapRecipient,address swapRouter,bytes swapData,bytes transactData)",
    ],
    [proof.proofArguments, proof.extData]
  );
  console.log("encoded: ", encoded);
  return encoded;
}
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
  const token = asset ? getTokenFromAddress(asset, chainId) : undefined;
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
    async (amount: BigNumber) => {
      console.log(`proveUnshield: ${amount}`);

      if (!connector) throw new Error("");
      if (typeof asset === "undefined") throw new Error("");
      const signer: Signer = await connector.getSigner();
      const proof = await zrclib.proveUnshield(
        amount,
        await signer.getAddress(),
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

  const proveSwapUnshield = useCallback(
    async (
      amountIn: BigNumber,
      amountOutMin: BigNumber,
      tokenAAddress: string,
      tokenBAddress: string,
      reshieldProof: FormattedProof
    ) => {
      if (!connector) throw new Error("");
      if (typeof asset === "undefined") throw new Error("");
      const signer: Signer = await connector.getSigner();

      const swapExecutor = getContract("SWAPEXEC", chainId, signer);
      const swapRouter = getContract("SWAPROUTER", chainId, signer);

      async function encodeSwapData() {
        return swapRouter.interface.encodeFunctionData("swap", [
          tokenAAddress,
          tokenBAddress,
          amountIn,
        ]);
      }

      const swapParams = {
        tokenOut: BigNumber.from(tokenBAddress),
        amountOutMin: amountOutMin,
        swapRecipient: BigNumber.from(0), // 0 means will re-shield into the pool
        swapRouter: BigNumber.from(swapRouter.address),
        swapData: await tryUntilPasses(encodeSwapData),
        transactData: await tryUntilPasses(async () =>
          encodeData(reshieldProof)
        ),
      };
      console.log("swapParams: ", swapParams);
      const proof = await zrclib.proveUnshield(
        amountIn,
        swapExecutor.address,
        tokenAAddress,
        swapParams
      );
      console.log("proof: ", proof);
      return proof;
    },
    [chainId, asset, connector]
  );

  const proveSwapReshield = useCallback(
    async (amount: BigNumber, tokenBAddress: string) => {
      console.log(`proveShield: ${amount}`);

      if (!connector) throw new Error("");
      if (typeof asset === "undefined") throw new Error("");

      const proof = await zrclib.proveShield(
        amount,
        BigNumber.from(tokenBAddress)
      );
      return proof;
    },
    [asset, connector]
  );

  const transactAndSwap = useCallback(
    async (proof: FormattedProof) => {
      console.log(`proveShield: ${JSON.stringify(proof)}`);

      if (!connector) return;
      if (typeof asset === "undefined") return;
      if (typeof chainId === "undefined") return;

      const signer: Signer = await connector.getSigner();
      const contract = getContract("MASP", chainId, signer);

      const tx = await contract.transactAndSwap(proof);
      await tx.wait();
    },
    [asset, chainId, connector]
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
      token,
      approve,
      proveSwapUnshield,
      proveSwapReshield,
      transactAndSwap,
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
    token,
    faucet,
    proveShield,
    proveUnshield,
    proveTransfer,
    send,
    approve,
    proveSwapUnshield,
    proveSwapReshield,
    transactAndSwap,
  ]);
  return (
    <ZrclibContext.Provider value={api}>{p.children}</ZrclibContext.Provider>
  );
}

export function useZrclib() {
  return useContext(ZrclibContext);
}
