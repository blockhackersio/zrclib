import { Profile } from "./Profile";
import { Vertical } from "@/ui/Vertical";
import { ReactNode } from "react";
import * as Login from "@/components/forms/login";
import { useZrclib } from "./providers/ZrclibProvider";

function ConnectPage() {
  return (
    <Vertical className="h-full p-20">
      <div className="text-lg mb-4">Connect your Wallet!</div>
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
  const { isConnected, loggedIn, login, balances, chainId, address } =
    useZrclib();

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

  return (
    <LayoutHolder>
      <Profile address={address} balances={balances} chainId={chainId} />
    </LayoutHolder>
  );
}
