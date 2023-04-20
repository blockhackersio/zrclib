/** @jsxImportSource theme-ui */

import { Decimal } from "@liquity/lib-base";
import React, { useEffect, useState } from "react";
import { Flex, Button, Spinner, Heading, Close, Box } from "theme-ui";
import { Amount } from "../../../ActionDescription";
import { ErrorDescription } from "../../../ErrorDescription";
import { Icon } from "../../../Icon";
import {
  EditableRow
} from "../../../Trove/Editor";
import { useBondView } from "../../context/BondViewContext";
import { TokenIndex, ShieldAction } from "../../context/transitions";

const tokenSymbol: Record<TokenIndex.ZUSD, string> = {
  [TokenIndex.ZUSD]: "ZUSD"
};

const marginalAmount = Decimal.ONE.div(1000);

export const SwapPane: React.FC = () => {
  const {
    dispatchEvent,
    statuses,
    inputToken,
    lusdBalance,
    shieldAction
  } = useBondView();
  const editingState = useState<string>();
  const inputTokenBalance = 
    lusdBalance ?? Decimal.ZERO;
  const [inputAmount, setInputAmount] = useState<Decimal>(Decimal.ZERO);
  const [outputAmount, setOutputAmount] = useState<Decimal>();

  const isApprovePending = statuses.APPROVE_AMM === "PENDING";
  const isSwapPending = statuses.SWAP === "PENDING";
  const isBalanceInsufficient = inputAmount.gt(inputTokenBalance);

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

    dispatchEvent("CONFIRM_PRESSED", {
      inputAmount,
      minOutputAmount: outputAmount
    });
  };

  const handleBackPressed = () => {
    dispatchEvent("BACK_PRESSED");
  };

  return (
    <>
      <Heading as="h2" sx={{ pt: 2, pb: 3, px: 2 }}>
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
        label=""
        inputId="swap-input-amount"
        amount={inputAmount.prettify(2)}
        unit="ZUSD"
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
            {inputAmount.sub(inputTokenBalance).prettify(2)} {"ZUSD"}
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

        {false ? (
          <Button
            variant="primary"
            onClick={handleConfirmPressed}
            disabled={
              inputAmount.isZero ||
              !outputAmount ||
              isBalanceInsufficient ||
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
