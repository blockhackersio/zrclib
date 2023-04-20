import React from "react";
import { useBondView } from "./context/BondViewContext";
import { Idle } from "./views/idle/Idle";
import { InfoMessage } from "../InfoMessage";
import { Container } from "theme-ui";
import { Swapping } from "./views/swapping/Swapping";

export const Bonds: React.FC = () => {
  const { view } = useBondView();

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
