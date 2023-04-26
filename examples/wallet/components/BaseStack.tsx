import { useAccount, useDisconnect } from "wagmi";
import { Profile } from "./Profile";
import { Vertical } from "@/ui/Vertical";
import { ReactNode, useState } from "react";
import * as Login from "@/components/forms/login";
import { useShieldedPoolSdk } from "./providers/ShieldedPoolSdkProvider";
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

function ProfilePage({ address }: { address: `0x${string}` | undefined }) {
  return <Profile address={address} />;
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

export function BaseStack() {
  const { address, isConnected } = useAccount();

  const sdk = useShieldedPoolSdk();

  if (!isConnected) {
    return (
      <LayoutHolder>
        <ConnectPage />
      </LayoutHolder>
    );
  }

  if (!sdk.isLoggedIn) {
    return (
      <LayoutHolder>
        <LoginPage onLoginSuccess={sdk.login} />
      </LayoutHolder>
    );
  }

  return (
    <LayoutHolder>
      <ProfilePage address={address} />
    </LayoutHolder>
  );
}
