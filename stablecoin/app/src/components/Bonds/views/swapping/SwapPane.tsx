/** @jsxImportSource theme-ui */

import { Decimal } from "@liquity/lib-base";
import React, { useEffect, useState } from "react";
import { Flex, Button, Spinner, Heading, Close, Box } from "theme-ui";
import { Amount } from "../../../ActionDescription";
import { ErrorDescription } from "../../../ErrorDescription";
import { Icon } from "../../../Icon";
import { Placeholder } from "../../../Placeholder";
import {
  DisabledEditableAmounts,
  DisabledEditableRow,
  EditableRow
} from "../../../Trove/Editor";
import { useBondView } from "../../context/BondViewContext";
import { BLusdAmmTokenIndex, ShieldAction } from "../../context/transitions";

const tokenSymbol: Record<BLusdAmmTokenIndex.BLUSD | BLusdAmmTokenIndex.ZUSD, string> = {
  [BLusdAmmTokenIndex.BLUSD]: "bLUSD",
  [BLusdAmmTokenIndex.ZUSD]: "ZUSD"
};

const outputToken: Record<
  BLusdAmmTokenIndex.BLUSD | BLusdAmmTokenIndex.ZUSD,
  BLusdAmmTokenIndex.BLUSD | BLusdAmmTokenIndex.ZUSD
> = {
  [BLusdAmmTokenIndex.BLUSD]: BLusdAmmTokenIndex.ZUSD,
  [BLusdAmmTokenIndex.ZUSD]: BLusdAmmTokenIndex.BLUSD
};

const marginalAmount = Decimal.ONE.div(1000);

type SlippageTolerance = "half" | "one" | "custom";

const checkSlippageTolerance = (value: string): SlippageTolerance => {
  if (value === "half" || value === "one" || value === "custom") {
    return value;
  }

  throw new Error(`invalid slippage tolerance choice "${value}"`);
};

export const SwapPane: React.FC = () => {
  const {
    dispatchEvent,
    statuses,
    inputToken,
    lusdBalance,
    bLusdBalance,
    isInputTokenApprovedWithBLusdAmm,
    bLusdAmmBLusdBalance,
    bLusdAmmLusdBalance,
    getExpectedSwapOutput,
    shieldAction
  } = useBondView();
  const editingState = useState<string>();
  const inputTokenBalance =
    (inputToken === BLusdAmmTokenIndex.BLUSD ? bLusdBalance : lusdBalance) ?? Decimal.ZERO;
  const [inputAmount, setInputAmount] = useState<Decimal>(Decimal.ZERO);
  const [outputAmount, setOutputAmount] = useState<Decimal>();
  const [exchangeRate, setExchangeRate] = useState<Decimal>();
  const [priceImpact, setPriceImpact] = useState<Decimal>();
  const [slippageToleranceChoice, setSlippageToleranceChoice] = useState<SlippageTolerance>("half");
  const [customSlippageTolerance, setCustomSlippageTolerance] = useState<Decimal>();

  const isApprovePending = statuses.APPROVE_AMM === "PENDING";
  const isSwapPending = statuses.SWAP === "PENDING";
  const isBalanceInsufficient = inputAmount.gt(inputTokenBalance);
  const isSlippageToleranceInvalid =
    slippageToleranceChoice === "custom" &&
    (!customSlippageTolerance ||
      customSlippageTolerance.lt(0.001) ||
      customSlippageTolerance.gt(Decimal.ONE));

  // Used in dependency list of effect to recalculate output amount in case of pool changes
  const poolState = `${bLusdAmmBLusdBalance},${bLusdAmmLusdBalance}`;

  const handleDismiss = () => {
    dispatchEvent("ABORT_PRESSED");
  };

  const handleApprovePressed = () => {
    dispatchEvent("APPROVE_PRESSED");
  };

  const handleConfirmPressed = () => {
    if (!outputAmount) {
      return;
    }

    const slippageTolerance =
      slippageToleranceChoice === "half"
        ? Decimal.from(0.005)
        : slippageToleranceChoice === "one"
        ? Decimal.from(0.01)
        : customSlippageTolerance;

    if (!slippageTolerance || isSlippageToleranceInvalid) {
      return;
    }

    const minOutputFactor = Decimal.ONE.sub(slippageTolerance);

    dispatchEvent("CONFIRM_PRESSED", {
      inputAmount,
      minOutputAmount: outputAmount.mul(minOutputFactor)
    });
  };

  const handleBackPressed = () => {
    dispatchEvent("BACK_PRESSED");
  };

  const handleSlippageToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSlippageToleranceChoice(checkSlippageTolerance(e.target.value));

  useEffect(() => {
    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      setOutputAmount(undefined);
      setExchangeRate(undefined);
      setPriceImpact(undefined);

      try {
        const [marginalOutput, outputAmount] = await Promise.all([
          getExpectedSwapOutput(inputToken, marginalAmount),
          inputAmount.nonZero && getExpectedSwapOutput(inputToken, inputAmount)
        ]);

        if (cancelled) return;

        const marginalExchangeRate = marginalOutput.div(marginalAmount);
        const exchangeRate = outputAmount?.div(inputAmount);
        const priceImpact = exchangeRate?.lte(marginalExchangeRate)
          ? marginalExchangeRate.sub(exchangeRate).div(marginalExchangeRate)
          : Decimal.ZERO;

        setOutputAmount(outputAmount ?? Decimal.ZERO);
        setExchangeRate(exchangeRate ?? marginalExchangeRate);
        setPriceImpact(priceImpact);
      } catch (error) {
        console.error("getExpectedSwapOutput() failed");
        console.log(error);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      cancelled = true;
    };
  }, [inputToken, inputAmount, getExpectedSwapOutput, poolState]);

  return (
    <>
      <Heading as="h2" sx={{ pt: 2, pb: 3, px: 2 }}>
        {console.log("shieldAction value:", shieldAction)}
        <Flex sx={{ justifyContent: "center" }}>
          {shieldAction === ShieldAction.SHIELD ? <>Deposit</> : shieldAction === ShieldAction.TRANSFER ? <>Transfer</> : <>Withdraw</>} ZUSD;
        </Flex>
        <Close
          onClick={handleDismiss}
          sx={{
            position: "absolute",
            right: "24px",
            top: "24px"
          }}
        />
      </Heading>

      <EditableRow
        label="Sell"
        inputId="swap-input-amount"
        amount={inputAmount.prettify(2)}
        unit={tokenSymbol[inputToken]}
        editingState={editingState}
        editedAmount={inputAmount.toString()}
        setEditedAmount={amount => setInputAmount(Decimal.from(amount))}
        maxAmount={inputTokenBalance.toString()}
        maxedOut={inputAmount.eq(inputTokenBalance)}
      />

      <Flex sx={{ justifyContent: "center", mb: 3 }}>
        <Icon name="arrow-down" size="lg" />
      </Flex>

      {isBalanceInsufficient && (
        <ErrorDescription>
          Amount exceeds your balance by{" "}
          <Amount>
            {inputAmount.sub(inputTokenBalance).prettify(2)} {tokenSymbol[inputToken]}
          </Amount>
        </ErrorDescription>
      )}

      <Flex variant="layout.actions">
        <Button
          variant="cancel"
          onClick={handleBackPressed}
          disabled={isApprovePending || isSwapPending}
        >
          Back
        </Button>

        {isInputTokenApprovedWithBLusdAmm ? (
          <Button
            variant="primary"
            onClick={handleConfirmPressed}
            disabled={
              inputAmount.isZero ||
              !outputAmount ||
              isBalanceInsufficient ||
              isSlippageToleranceInvalid ||
              isSwapPending
            }
          >
            {isSwapPending ? <Spinner size="28px" sx={{ color: "white" }} /> : <>Confirm</>}
          </Button>
        ) : (
          <Button variant="primary" onClick={handleApprovePressed} disabled={isApprovePending}>
            {isApprovePending ? <Spinner size="28px" sx={{ color: "white" }} /> : <>Approve</>}
          </Button>
        )}
      </Flex>
    </>
  );
};
