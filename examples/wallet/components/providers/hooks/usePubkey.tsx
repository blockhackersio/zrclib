import { Account } from "@zrclib/sdk";

export function usePubkey(account?: Account): string | undefined {
  if (!account) return;
  try {
    return account.getKeypair().toString();
  } catch (_) {
    return;
  }
}
