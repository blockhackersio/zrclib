import { Vertical } from "@/ui/Vertical";
import { useConnectModal } from "@rainbow-me/rainbowkit";
export const GRAPHIC = `


╰(✿´⌣\`✿)╯♡


`;
export function ConnectPage() {
  const { openConnectModal } = useConnectModal();
  return (
    <Vertical className="h-full p-20  font-mono">
      <pre>{GRAPHIC}</pre>
      <div className="flex flex-row justify-center">
        <div
          onClick={openConnectModal}
          className="text-lg mb-4 bg-black text-white rounded-md cursor-pointer font-mono px-4 py-2 "
        >
          Connect your Wallet!
        </div>
      </div>
      <div className="text-md">
        You need to be connected to use the coinshield wallet
      </div>
    </Vertical>
  );
}
