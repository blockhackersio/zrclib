import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Connector } from "wagmi";
const cookies = new Cookies();

const COOKIE_CHAIN_ID = "_zrc_chainId";

function getPersistedChainId() {
  const fromQuery = getQueryStringChainId();
  if (fromQuery) return fromQuery;
  const fromCookie = cookies.get(COOKIE_CHAIN_ID) || undefined;
  return Number(fromCookie) || undefined;
}

function getQueryStringChainId() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.has("chainId")) {
    return Number(params.get("chainId")) ?? undefined;
  }
}

type UsePersistentChainIdProps = {
  defaultId?: number;
  connector?: Connector;
};

export function usePersistentChainId({
  defaultId = getPersistedChainId() ?? 1,
  connector,
}: UsePersistentChainIdProps = {}) {
  const [chainId, setChainId] = useState(defaultId);

  useEffect(() => {
    cookies.set(COOKIE_CHAIN_ID, chainId);
  }, [chainId]);

  useEffect(() => {
    if (!connector) return;

    connector.getChainId().then(setChainId);
  }, [connector]);

  return chainId;
}
