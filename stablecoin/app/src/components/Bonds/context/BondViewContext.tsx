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
  selectedBondId?: string;
  protocolInfo?: ProtocolInfo;
  stats?: Stats;
  bonds?: Bond[];
  selectedBond?: Bond;
  optimisticBond?: OptimisticBond;
  bLusdBalance?: Decimal;
  lusdBalance?: Decimal;
  lpTokenBalance?: Decimal;
  stakedLpTokenBalance?: Decimal;
  lpTokenSupply?: Decimal;
  bLusdAmmBLusdBalance?: Decimal;
  bLusdAmmLusdBalance?: Decimal;
  statuses: BondTransactionStatuses;
  isSynchronizing: boolean;
  getLusdFromFaucet: () => Promise<void>;
  simulatedProtocolInfo?: ProtocolInfo;
  setSimulatedMarketPrice: (marketPrice: Decimal) => void;
  resetSimulatedMarketPrice: () => void;
  hasFoundContracts: boolean;
  isBLusdApprovedWithBlusdAmm: boolean;
  isLusdApprovedWithBlusdAmm: boolean;
  isLusdApprovedWithAmmZapper: boolean;
  isBLusdApprovedWithAmmZapper: boolean;
  isBLusdLpApprovedWithAmmZapper: boolean;
  isBLusdLpApprovedWithGauge: boolean;
  inputToken: TokenIndex.BLUSD | TokenIndex.ZUSD;
  isInputTokenApprovedWithBLusdAmm: boolean;
  getExpectedSwapOutput: (inputToken: TokenIndex, inputAmount: Decimal) => Promise<Decimal>;
  getExpectedLpTokens: (bLusdAmount: Decimal, lusdAmount: Decimal) => Promise<Decimal>;
  getExpectedWithdrawal: (
    burnLp: Decimal,
    output: TokenIndex | "both"
  ) => Promise<Map<TokenIndex, Decimal>>;
  isBootstrapPeriodActive?: boolean;
  hasLoaded: boolean;
  addresses: Addresses;
  lpRewards: BLusdLpRewards | undefined;
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
