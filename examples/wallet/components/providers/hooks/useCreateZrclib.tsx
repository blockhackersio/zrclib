import { getContract } from "@/contracts/get_contract";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { utils, BigNumber, BigNumberish } from "ethers";
import { FormattedProof } from "@zrclib/sdk/src/types";
import { tryUntilPasses } from "@/utils";
import { usePersistentChainId } from "./usePersistentChainId";
import { useBalances } from "./useBalances";
import { useAccountExists } from "./useAccountExists";
import { usePubkey } from "./usePubkey";
import { useTokenAsset } from "./useTokenAsset";
import { useTokenContract } from "./useTokenContract";
import { useSigner } from "./useSigner";
import { useMASPContract } from "./useMASPContract";
import { Account } from "@zrclib/sdk";
import { getProver } from "@/services/get_prover";

export function encodeData(proof: FormattedProof) {
  console.log("proof: ", proof);
  const abi = new utils.AbiCoder();
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

export function useCreateZrclib(proofGen = getProver()) {
  const [account, setAccount] = useState<Account>();
  const loggedIn = !!account;

  const { address, isConnected, connector } = useAccount({
    onDisconnect: () => {
      if (!account) return;
      account.logout().then(() => {
        setAccount(undefined);
      });
    },
  });
  const signer = useSigner(connector);
  const balances = useBalances(account, signer);
  const pubkey = usePubkey(account);
  const chainId = usePersistentChainId({ connector });
  const { asset, setAsset, token } = useTokenAsset(chainId);
  const accountExists = useAccountExists(chainId, !!account);
  const tokenContract = useTokenContract(token, chainId, signer);
  const maspContract = useMASPContract(chainId, signer);

  console.log("state setup:", {
    maspContract,
    tokenContract,
    signer,
    balances,
    pubkey,
    token,
    asset,
    accountExists,
  });

  const createAndLogin = useCallback(
    async (password: string) => {
      if (!maspContract) throw new Error("CONTRACT_NOT_AVAILABLE");
      if (!signer) throw new Error("SIGNER_NOT_AVAILABLE");
      try {
        console.log("creating Account...");
        const account = await Account.create(
          maspContract,
          signer,
          password,
          chainId,
          proofGen
        );
        console.log("account.loging()...");
        await account.login();
        console.log("setAccount...");
        setAccount(account);
      } catch (err) {
        console.log(err);
      }
    },
    [chainId, proofGen, signer, maspContract]
  );

  const login = useCallback(async () => {
    if (!account) return;
    try {
      await account.login();
    } catch (err) {
      console.log(err);
    }
  }, [account]);

  const faucet = useCallback(
    async (amount: BigNumber) => {
      console.log(`faucet: ${amount}`);
      if (!tokenContract) throw new Error("CONTRACT_NOT_AVAILABLE");
      if (!signer) throw new Error("SIGNER_NOT_AVAILABLE");
      const tx = await tokenContract.mint(await signer.getAddress(), amount);
      await tx.wait();
    },
    [signer, tokenContract]
  );

  const send = useCallback(
    async (proof: FormattedProof) => {
      console.log(`proveShield: ${JSON.stringify(proof)}`);
      if (!maspContract) throw new Error("CONTRACT_NOT_AVAILABLE");
      const tx = await maspContract.transact(proof);
      await tx.wait();
    },
    [maspContract]
  );

  const proveShield = useCallback(
    async (amount: BigNumber) => {
      console.log(`proveShield: ${amount}`);
      if (!account) throw new Error("ACCOUNT_NOT_PROVIDED");
      if (typeof asset === "undefined") throw new Error("ASSET_NOT_PROVIDED");
      return await account.proveShield(amount, BigNumber.from(asset));
    },
    [asset, account]
  );

  const proveUnshield = useCallback(
    async (amount: BigNumber) => {
      console.log(`proveUnshield: ${amount}`);
      if (!signer) throw new Error("SIGNER_NOT_PROVIDED");
      if (!account) throw new Error("ACCOUNT_NOT_PROVIDED");
      if (typeof asset === "undefined") throw new Error("ASSET_NOT_PROVIDED");

      const proof = await account.proveUnshield(
        amount,
        await signer.getAddress(),
        BigNumber.from(asset)
      );
      return proof;
    },
    [account, asset, signer]
  );

  const proveTransfer = useCallback(
    async (amount: BigNumberish, toPubKey: string) => {
      console.log(`proveTransfer: ${amount}`);
      if (!account) throw new Error("ACCOUNT_NOT_PROVIDED");
      if (typeof asset === "undefined") throw new Error("ASSET_NOT_PROVIDED");
      const proof = await account.proveTransfer(
        amount,
        toPubKey,
        BigNumber.from(asset)
      );
      return proof;
    },
    [account, asset]
  );

  const proveSwapUnshield = useCallback(
    async (
      amountIn: BigNumber,
      amountOutMin: BigNumber,
      tokenAAddress: string,
      tokenBAddress: string,
      reshieldProof: FormattedProof
    ) => {
      if (!signer) throw new Error("SIGNER_NOT_PROVIDED");
      if (!account) throw new Error("ACCOUNT_NOT_PROVIDED");

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
        swapRecipient: BigNumber.from(0),
        swapRouter: BigNumber.from(swapRouter.address),
        swapData: await tryUntilPasses(encodeSwapData),
        transactData: await tryUntilPasses(async () =>
          encodeData(reshieldProof)
        ),
      };
      console.log("swapParams: ", swapParams);
      const proof = await account.proveUnshield(
        amountIn,
        swapExecutor.address,
        tokenAAddress,
        swapParams
      );
      console.log("proof: ", proof);
      return proof;
    },
    [account, chainId, signer]
  );

  const proveSwapReshield = useCallback(
    async (amount: BigNumber, tokenBAddress: string) => {
      console.log(`proveShield: ${amount}`);
      if (typeof asset === "undefined") throw new Error("ASSET_NOT_PROVIDED");
      if (!account) throw new Error("ACCOUNT_NOT_PROVIDED");

      const proof = await account.proveShield(
        amount,
        BigNumber.from(tokenBAddress)
      );
      return proof;
    },
    [account, asset]
  );

  const transactAndSwap = useCallback(
    async (proof: FormattedProof) => {
      console.log(`proveShield: ${JSON.stringify(proof)}`);
      if (!maspContract) throw new Error("CONTRACT_NOT_PROVIDED");
      const tx = await maspContract.transactAndSwap(proof);
      await tx.wait();
    },
    [maspContract]
  );

  const approve = useCallback(
    async (amount: BigNumber) => {
      console.log(`approve: ${amount}`);
      if (!maspContract || !tokenContract)
        throw new Error("CONTRACT_NOT_PROVIDED");

      const tx = await tokenContract.approve(maspContract.address, amount);
      await tx.wait();
    },
    [tokenContract, maspContract]
  );

  const publicTransfer = useCallback(
    async (amount: BigNumberish, to: string) => {
      console.log("publicTransfer");
      if (!tokenContract) throw new Error("TOKEN_CONTRACT_NOT_PROVIDED");
      console.log("transfer", { to, amount, token: tokenContract.address });
      const tx = await tokenContract.transfer(to, amount);
      await tx.wait();
    },
    [tokenContract]
  );

  return useMemo(() => {
    const lib = {
      address,
      accountExists,
      approve,
      asset,
      balances,
      chainId,
      createAndLogin,
      faucet,
      isConnected,
      login,
      loggedIn,
      proveShield,
      proveSwapReshield,
      proveSwapUnshield,
      proveTransfer,
      proveUnshield,
      pubkey,
      publicTransfer,
      send,
      setAsset,
      token,
      transactAndSwap,
    };
    console.log(lib);
    return lib;
  }, [
    address,
    accountExists,
    approve,
    asset,
    balances,
    chainId,
    createAndLogin,
    faucet,
    isConnected,
    login,
    loggedIn,
    proveShield,
    proveSwapReshield,
    proveSwapUnshield,
    proveTransfer,
    proveUnshield,
    pubkey,
    publicTransfer,
    send,
    setAsset,
    token,
    transactAndSwap,
  ]);
}
