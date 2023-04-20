import React from "react";
import { Text, Flex, Box, Heading } from "theme-ui";
import { useEffect, useState } from "react";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { COIN } from "../strings";
import { useLiquity } from "../hooks/LiquityContext";
import { shortenAddress } from "../utils/shortenAddress";

import { Icon } from "./Icon";
import { useShieldedPoolContracts } from "./Bonds/context/useBondContracts";
import { ethers } from "ethers";

const select = ({ accountBalance, lusdBalance, lqtyBalance }: LiquityStoreState) => ({
  accountBalance,
  lusdBalance,
  lqtyBalance
});

export const UserAccount: React.FC = () => {
  const { account } = useLiquity();
  const { accountBalance } = useLiquitySelector(select);
  const { zusdToken } = useShieldedPoolContracts();
  const [ zusdBalance, setZusdBalance] = useState<string | null>(null);

  const getZusdBalance = async () => {
    const balance = await zusdToken?.balanceOf(account);
    if (balance !== undefined) {
      const actualBalance = ethers.utils.formatUnits(balance, 18);
      setZusdBalance(actualBalance);
    }
  };

  useEffect(() => {
    getZusdBalance();
  }, [account, zusdToken]);

  return (
    <Box sx={{ display: ["none", "flex"] }}>
      <Flex sx={{ alignItems: "center" }}>
        <Icon name="user-circle" size="lg" />
        <Flex sx={{ ml: 3, mr: 4, flexDirection: "column" }}>
          <Heading sx={{ fontSize: 1 }}>Connected as</Heading>
          <Text as="span" sx={{ fontSize: 1 }}>
            {shortenAddress(account)}
          </Text>
        </Flex>
      </Flex>

      <Flex sx={{ alignItems: "center" }}>
        <Icon name="wallet" size="lg" />

        {([
          ["ETH", accountBalance],
          [COIN, Decimal.from(zusdBalance || 0)]
        ] as const).map(([currency, balance], i) => (
          <Flex key={i} sx={{ ml: 3, flexDirection: "column" }}>
            <Heading sx={{ fontSize: 1 }}>{currency}</Heading>
            <Text sx={{ fontSize: 1 }}>{balance.prettify()}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
