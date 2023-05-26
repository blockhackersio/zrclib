import { PlaintextDB } from "@zrclib/sdk";
import { useEffect, useState } from "react";

export function useAccountExists(chainId: number, loggedIn: boolean) {
  const [accountExists, setAccountExists] = useState(false);
  console.log("useAccountExists", { chainId, loggedIn });
  useEffect(() => {
    setTimeout(async () => {
      setAccountExists(await accountExistsOnChain(chainId));
    }, 100);
  }, [chainId, loggedIn]);

  return accountExists;
}

async function accountExistsOnChain(chainId: number): Promise<boolean> {
  const db = await PlaintextDB.create(chainId);
  const keys = await db.publicKeys.getAll();
  return keys.length > 0;
}
