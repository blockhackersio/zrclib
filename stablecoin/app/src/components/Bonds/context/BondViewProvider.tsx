import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { BondViewContext, BondViewContextType } from "./BondViewContext";
import {
  BondView,
  BondEvent,
  Payload,
  BondTransactionStatuses,
  SwapPayload,
  ApprovePressedPayload,
  ShieldAction
} from "./transitions";
import { TokenIndex } from "./transitions";
import { transitions } from "./transitions";
import { Decimal } from "@liquity/lib-base";
import { useLiquity } from "../../../hooks/LiquityContext";
import { api, _getProtocolInfo } from "./api";
import { useTransaction } from "../../../hooks/useTransaction";
import type { ERC20Faucet } from "@liquity/chicken-bonds/lusd/types";
import { useShieldedPoolContracts } from "./useBondContracts";
import { useWeb3React } from "@web3-react/core";
import { useBondAddresses } from "./BondAddressesContext";
import { ethers } from "ethers";

// Refresh backend values every 15 seconds
const SYNCHRONIZE_INTERVAL_MS = 15 * 1000;

const isValidEvent = (view: BondView, event: BondEvent): boolean => {
  return transitions[view][event] !== undefined;
};

const transition = (view: BondView, event: BondEvent): BondView => {
  const nextView = transitions[view][event] ?? view;
  return nextView;
};

export const EXAMPLE_NFT = "./bonds/egg-nft.png";

export const BondViewProvider: React.FC = props => {
  const { children } = props;
  const [view, setView] = useState<BondView>("IDLE");
  const viewRef = useRef<BondView>(view);
  const [shouldSynchronize, setShouldSynchronize] = useState<boolean>(true);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [inputToken, setInputToken] = useState<TokenIndex.ZUSD>(
    TokenIndex.ZUSD
  );
  const [shieldAction, setShieldAction] = useState<ShieldAction>(ShieldAction.SHIELD | ShieldAction.UNSHIELD | ShieldAction.TRANSFER);
  const [statuses, setStatuses] = useState<BondTransactionStatuses>({
    CREATE: "IDLE",
    CANCEL: "IDLE",
    CLAIM: "IDLE",
    APPROVE_AMM: "IDLE",
    APPROVE_SPENDER: "IDLE",
    SWAP: "IDLE",
    MANAGE_LIQUIDITY: "IDLE"
  });
  const [ lusdBalance, setZusdBalance] = useState<Decimal>();

  // const [lusdBalance, setLusdBalance] = useState<Decimal>();
  const { account } = useLiquity();
  const {
    ZUSD_ADDRESS
  } = useBondAddresses();
  const contracts = useShieldedPoolContracts();
  const { zusdToken } = useShieldedPoolContracts();
  const { chainId } = useWeb3React();
  const isMainnet = chainId === 1;

  const getZusdBalance = async () => {
    const balance = await zusdToken?.balanceOf(account);
    if (balance !== undefined) {
      const actualBalance = ethers.utils.formatUnits(balance, 18);
      setZusdBalance(Decimal.from(actualBalance));
    }
  };

  useEffect(() => {
    getZusdBalance();
  }, [account, zusdToken]);

  useEffect(() => {
    if (isSynchronizing) return;
    const timer = setTimeout(() => setShouldSynchronize(true), SYNCHRONIZE_INTERVAL_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [isSynchronizing]);

  const [approveTokens, approveTokensStatus] = useTransaction(
    async ({ tokensNeedingApproval }: ApprovePressedPayload) => {
      if (contracts.zusdToken === undefined) return;
      for (const [token, spender] of Array.from(tokensNeedingApproval)) {
        if (token === TokenIndex.ZUSD) {
          await api.approveToken(contracts.zusdToken, ZUSD_ADDRESS);
        }
      }
    },
    [
      contracts.zusdToken,
    ]
  );

  const dispatchEvent = useCallback(
    async (event: BondEvent, payload?: Payload) => {
      if (!isValidEvent(viewRef.current, event)) {
        console.error("invalid event", event, payload, "in view", viewRef.current);
        return;
      }

      const nextView = transition(viewRef.current, event);
      setView(nextView);

      if (payload && "inputToken" in payload && payload.inputToken !== inputToken) {
        setInputToken(payload.inputToken);
      }

      if (payload && "shieldAction" in payload) {
        setShieldAction(payload.shieldAction);
      }

      const isCurrentViewEvent = (_view: BondView, _event: BondEvent) =>
        viewRef.current === _view && event === _event;

      try {
        if (isCurrentViewEvent("SWAPPING", "CONFIRM_PRESSED")) {
          const { inputAmount, minOutputAmount } = payload as SwapPayload;
          // TODO: do deposit
          await dispatchEvent("SWAP_CONFIRMED");
        }
      } catch (error: unknown) {
        console.error("dispatchEvent(), event handler failed\n\n", error);
      }
    },
    [
      approveTokens,
      inputToken,
    ]
  );

  useEffect(() => {
    setStatuses(statuses => ({
      ...statuses,
      APPROVE_SPENDER: approveTokensStatus,
    }));
  }, [
    approveTokensStatus,
  ]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const provider: BondViewContextType = {
    view,
    dispatchEvent,
    statuses,
    lusdBalance,
    isSynchronizing,
    inputToken,
    addresses: contracts.addresses,
    shieldAction
  };

  // @ts-ignore
  window.__LIQUITY_BONDS__ = provider.current;

  return <BondViewContext.Provider value={provider}>{children}</BondViewContext.Provider>;
};
