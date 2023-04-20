import React, { useEffect, useState } from "react";
import { Card, Box, Heading, Flex, Button } from "theme-ui";
import { Empty } from "./Empty";
import { useBondView } from "../../context/BondViewContext";
import { BONDS } from "../../lexicon";
import { InfoIcon } from "../../../InfoIcon";
import { ShieldPressedPayload, ShieldAction } from "../../context/transitions";
import { useLiquity } from "../../../../hooks/LiquityContext";
import { useBondAddresses } from "../../context/BondAddressesContext";

export const Idle: React.FC = () => {
  const { liquity } = useLiquity();
  const { ZUSD_ADDRESS } = useBondAddresses();

  const { dispatchEvent, lusdBalance } = useBondView();
  const [chain, setChain] = useState<number>();

  useEffect(() => {
    (async () => {
      if (liquity.connection.signer === undefined || chain !== undefined) return;
      const chainId = await liquity.connection.signer.getChainId();
      setChain(chainId);
    })();
  }, [chain, liquity.connection.signer]);

  const hasBonds = false;

  const handleShieldZusdPressed = () => 
    dispatchEvent("SHIELD_PRESSED", { shieldAction: ShieldAction.SHIELD } as ShieldPressedPayload);

    const handleTransferZusdPressed = () => 
    dispatchEvent("SHIELD_PRESSED", { shieldAction: ShieldAction.TRANSFER } as ShieldPressedPayload);
  
  const handleUnshieldZusdPressed = () => 
    dispatchEvent("SHIELD_PRESSED", { shieldAction: ShieldAction.UNSHIELD } as ShieldPressedPayload);

  return (
    <>
      <Flex variant="layout.actions" sx={{ mt: 4, mb: 3 }}>
        <Button variant="outline" onClick={handleShieldZusdPressed}>
          Shield ZUSD
        </Button>

        <Button variant="outline" onClick={handleTransferZusdPressed}>
          Transfer ZUSD
        </Button>

        <Button variant="outline" onClick={handleUnshieldZusdPressed}>
          Unshield ZUSD
        </Button>

        {hasBonds && (
          <Button variant="primary" onClick={() => dispatchEvent("CREATE_BOND_PRESSED")}>
            Create another bond
          </Button>
        )}
      </Flex>

      {!hasBonds && (
        <Card>
          <Heading>
            <Flex>
              {BONDS.term}
              <InfoIcon
                placement="left"
                size="xs"
                tooltip={<Card variant="tooltip">{BONDS.description}</Card>}
              />
            </Flex>
          </Heading>
          <Box sx={{ p: [2, 3] }}>
            <Empty />
          </Box>
        </Card>
      )}
    </>
  );
};
