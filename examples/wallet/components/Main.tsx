import { Profile } from "./Profile";
import { ReactNode } from "react";
import * as Login from "@/components/forms/login";
import { useZrclib } from "./providers/ZrclibProvider";
import { useLayoutTemplate } from "@/ui/LayoutProvider";
import { Horizontal } from "@/ui/Horizontal";
import { Button } from "@/ui/Button";
import { getChainName } from "@/contracts/get_contract";
import { ConnectWalletPanel } from "./panels/ConnectWalletPanel";
import { CreateAccountPanel } from "./panels/CreateAccountPanel";
import { SigninAccountPanel } from "./panels/SigninAccountPanel";

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

export function Main() {
  const {
    setAsset,
    asset,
    isConnected,
    login,
    loggedIn,
    createAndLogin,
    balances,
    chainId,
    address,
    pubkey,
    accountExists,
  } = useZrclib();

  console.log({
    accountExists,
    isConnected,
  });

  if (!isConnected) {
    return (
      <LayoutHolder>
        <ConnectWalletPanel />
      </LayoutHolder>
    );
  }

  if (!accountExists) {
    return (
      <LayoutHolder>
        <CreateAccountPanel
          onCreateAccount={createAndLogin}
          chainName={getChainName(chainId)}
        />
      </LayoutHolder>
    );
  }

  if (!loggedIn) {
    return (
      <LayoutHolder>
        <SigninAccountPanel onSignin={createAndLogin} />
      </LayoutHolder>
    );
  }

  // if (!accountExists && isConnected) {
  //   return (
  //     <LayoutHolder>
  //       <CreateAccountPanel onCreateAccount={createAndLogin} />
  //     </LayoutHolder>
  //   );
  // }

  return (
    <LayoutHolder>
      <Profile
        pubkey={pubkey}
        asset={asset}
        setAsset={setAsset}
        address={address}
        balances={balances}
        chainId={chainId}
      />
    </LayoutHolder>
  );
}
