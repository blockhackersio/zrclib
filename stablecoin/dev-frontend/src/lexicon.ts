export type Lexicon = {
  term: string;
  description?: string;
  link?: string;
};

export const BORROW_FEE: Lexicon = {
  term: "Borrowing Fee",
  description:
    "The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount (in ZUSD) and is part of a Trove's debt. The fee varies between 0.5% and 5% depending on ZUSD redemption volumes."
};

export const TVL: Lexicon = {
  term: "TVL",
  description:
    "The Total Value Locked (TVL) is the total value of Ether locked as collateral in the system, given in ETH and USD."
};

export const TCR: Lexicon = {
  term: "Total Collateral Ratio",
  description:
    "The ratio of the Dollar value of the entire system collateral at the current ETH:USD price, to the entire system debt."
};

export const SHIELDED_AMOUNT: Lexicon = {
  term: "Total Shielded Funds",
  description:
    "Shielded ZUSD circulating in the pool"
};

export const STABILITY_POOL_ZUSD: Lexicon = {
  term: "ZUSD in Stability Pool",
  description:
    "The total ZUSD currently held in the Stability Pool, expressed as an amount and a fraction of the ZUSD supply."
};

export const ETH: Lexicon = {
  term: "ETH"
};

export const ZUSD: Lexicon = {
  term: "ZUSD"
};

export const LQTY: Lexicon = {
  term: "LQTY"
};

export const TROVES: Lexicon = {
  term: "Troves",
  description: "The total number of active Troves in the system."
};

export const ZUSD_SUPPLY: Lexicon = {
  term: "ZUSD supply",
  description: "The total ZUSD minted by the Liquity Protocol."
};
