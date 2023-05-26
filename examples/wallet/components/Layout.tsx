import { ReactNode } from "react";
import Header from "./Header";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Dialog } from "@/ui/Dialog";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

export function PageLayout(p: {
  subtitle?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  dialogContent?: ReactNode;
}) {
  const { isConnected } = useAccount();
  const router = useRouter();

  const onClose = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      <Header
        title={p.title}
        subtitle={p.subtitle}
        rightpanel={isConnected ? <ConnectButton /> : null}
      />
      {p.children}
      <Dialog content={p.dialogContent} onClose={onClose} />
    </div>
  );
}
