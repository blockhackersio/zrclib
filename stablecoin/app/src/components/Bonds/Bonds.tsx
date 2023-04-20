import React from "react";
import { useBondView } from "./context/BondViewContext";
import { Idle } from "./views/idle/Idle";
import { InfoMessage } from "../InfoMessage";
import { Container } from "theme-ui";
import { Swapping } from "./views/swapping/Swapping";

export const Bonds: React.FC = () => {
  const { view, hasFoundContracts } = useBondView();

  if (!hasFoundContracts) {
    return (
      <Container sx={{ position: "absolute", left: "30%", top: "40%" }}>
        <InfoMessage title="Unsupported network">
          ZUSD Bonds don't seem to be deployed to this network.
        </InfoMessage>
      </Container>
    );
  }

  let View = null;
  switch (view) {
    case "SWAPPING": {
      View = <Swapping />;
      break;
    }
  }

  return (
    <>
      <Idle />
      {View}
    </>
  );
};
