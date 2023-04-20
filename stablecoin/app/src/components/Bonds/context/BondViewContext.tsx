import { createContext, useContext } from "react";
import type {
  BondView,
  BondEvent,
  Payload,
  Bond,
  Stats,
  BondTransactionStatuses,
  ProtocolInfo,
  OptimisticBond,
  TokenIndex,
  Addresses,
  BLusdLpRewards,
  ShieldAction
} from "./transitions";
import { PENDING_STATUS, CANCELLED_STATUS, CLAIMED_STATUS } from "../lexicon";
import { Decimal } from "@liquity/lib-base";

export type BondViewContextType = {
  view: BondView;
  dispatchEvent: (event: BondEvent, payload?: Payload) => void;
  zusdBalance?: Decimal;
  statuses: BondTransactionStatuses;
  isSynchronizing: boolean;
  inputToken: TokenIndex.BLUSD | TokenIndex.ZUSD;
  addresses: Addresses;
  shieldAction: ShieldAction;
};

export const BondViewContext = createContext<BondViewContextType | null>(null);

export const useBondView = (): BondViewContextType => {
  const context: BondViewContextType | null = useContext(BondViewContext);

  if (context === null) {
    throw new Error("You must add a <BondViewProvider> into the React tree");
  }

  return context;
};

export const statuses = {
  PENDING: PENDING_STATUS.term,
  CANCELLED: CANCELLED_STATUS.term,
  CLAIMED: CLAIMED_STATUS.term,
  NON_EXISTENT: "NON_EXISTENT"
};
