import React, { useEffect, useState } from "react";
import { Flex, Button } from "theme-ui";
import { useBondView } from "../../context/BondViewContext";
import { ShieldPressedPayload, ShieldAction } from "../../context/transitions";
import { useLiquity } from "../../../../hooks/LiquityContext";
import { useBondAddresses } from "../../context/BondAddressesContext";

export const Idle: React.FC = () => {
  const { liquity } = useLiquity();
  const { LUSD_OVERRIDE_ADDRESS } = useBondAddresses();

  const { dispatchEvent, getLusdFromFaucet, lusdBalance } = useBondView();
  const [chain, setChain] = useState<number>();

  useEffect(() => {
    (async () => {
      if (liquity.connection.signer === undefined || chain !== undefined) return;
      const chainId = await liquity.connection.signer.getChainId();
      setChain(chainId);
    })();
  }, [chain, liquity.connection.signer]);

  const showLusdFaucet = LUSD_OVERRIDE_ADDRESS !== null && lusdBalance?.eq(0);

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
      </Flex>
    </>
  );
};
