import { useEffect, useState } from "react";
import { BigNumber, Signer } from "ethers";
import { Account } from "@zrclib/sdk";
import { getContract, getTokens } from "@/contracts/get_contract";

export type AccountBalances = {
  privateBalances: Map<string, BigNumber>;
  publicBalances: Map<string, BigNumber>;
};

async function getAccountBalances(account: Account) {
  console.log("getBalances");
  if (!account) {
    console.log("no account set");
    return {
      privateBalances: new Map(),
      publicBalances: new Map(),
    };
  }
  const privateBalances = new Map();
  const publicBalances = new Map();
  const tokens = getTokens();

  // TODO paralelize ..
  for (const token of tokens) {
    const signer = account.signer;
    const contract = getContract(
      token,
      await account.signer.getChainId(),
      account.signer
    ).connect(signer);
    const publicBal = (await contract.balanceOf(
      await signer.getAddress()
    )) as BigNumber;
    const privateBal = await account.getBalance(
      BigNumber.from(contract.address)
    );
    console.log({
      token,
      address: contract.address,
      publicBal,
      privateBal,
    });
    publicBalances.set(contract.address, publicBal);
    privateBalances.set(contract.address, privateBal);
  }

  return { privateBalances, publicBalances };
}

export function useBalances(account?: Account, signer?: Signer) {
  const [balances, setBalances] = useState<AccountBalances>({
    privateBalances: new Map(),
    publicBalances: new Map(),
  });

  useEffect(() => {
    async function syncBalance() {
      if (!account || !account.isLoggedIn()) return;
      const balances = await getAccountBalances(account);
      setBalances(balances);
    }
    // This interval polling strategy is a little heavy handed
    // TODO: only poll on block or interface change
    const id = setInterval(syncBalance, 4000);
    return () => {
      clearInterval(id);
    };
  }, [account, signer]);

  return balances;
}
