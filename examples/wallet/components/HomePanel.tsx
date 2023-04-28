import { Profile } from "./Profile";
import { Vertical } from "@/ui/Vertical";
import { ReactNode } from "react";
import * as Login from "@/components/forms/login";
import { useZrclib } from "./providers/ZrclibProvider";
import { useConnectModal } from "@rainbow-me/rainbowkit";

function ConnectPage() {
  const { openConnectModal } = useConnectModal();
  return (
    <Vertical className="h-full p-20  font-mono">
      <pre>{`


╰(✿´⌣\`✿)╯♡


`}</pre>
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

function LayoutHolder(p: { children: ReactNode }) {
  return (
    <div className="text-center w-full min-h-screen p-4">{p.children}</div>
  );
}

function LoginPage(p: { onLoginSuccess?: (password: string) => void }) {
  const next = (data: Login.LoginData) => {
    p.onLoginSuccess && p.onLoginSuccess(data.password);
  };

  return <Login.Edit next={next} />;
}

export function HomePanel() {
  const {
    setAsset,
    asset,
    isConnected,
    loggedIn,
    login,
    balances,
    chainId,
    address,
  } = useZrclib();

  if (!isConnected) {
    return (
      <LayoutHolder>
        <ConnectPage />
      </LayoutHolder>
    );
  }

  if (!loggedIn) {
    return (
      <LayoutHolder>
        <LoginPage onLoginSuccess={login} />
      </LayoutHolder>
    );
  }
  console.log({ asset });
  return (
    <LayoutHolder>
      <Profile
        asset={asset}
        setAsset={setAsset}
        address={address}
        balances={balances}
        chainId={chainId}
      />
    </LayoutHolder>
  );
}
