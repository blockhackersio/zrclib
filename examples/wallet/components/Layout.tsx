import { ReactNode } from "react";
import Header from "./Header";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function PageLayout(p: {
  subtitle?: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        rightpanel={<ConnectButton />}
      />
      {p.children}
    </div>
  );
}
