import * as Setup from "@/components/forms/setup";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function ConnectWalletPanel() {
  const { openConnectModal } = useConnectModal();
  return <Setup.Start next={openConnectModal} />;
}
