import { Button, IconButton } from "@/ui/Button";
import { BigNumber } from "ethers";
import { Horizontal } from "@/ui/Horizontal";
import {
  MdSwapHorizontalCircle,
  MdAddCircle,
  MdArrowCircleRight,
} from "react-icons/md";
import { WalletActionButton } from "@/ui/WalletActionButton";
import { Spacer } from "@/ui/Spacer";
import { IconBaseProps } from "react-icons";
import { BsFillEmojiSunglassesFill } from "react-icons/bs";
import { ShieldedTabs } from "./ShieldedMode";
import { AccountBalances } from "@/services/zrclib";
import { ReactNode } from "react";
import { Vertical } from "@/ui/Vertical";
import { getTokenFromAddress } from "@/contracts/get_contract";
export function NormalizedSunglasses(p: IconBaseProps) {
  return (
    <div className={`h-${p.size} w-${p.size} p-[2px]`}>
      <BsFillEmojiSunglassesFill size={Number(p.size) - 4} />
    </div>
  );
}

function ProfileLayout({
  address,
  title,
  balances,
  chainId,
}: {
  title: ReactNode;
  address: `0x${string}` | undefined;
  balances: Map<string, BigNumber>;
  chainId: number;
}) {
  const entries = Array.from(balances.entries());

  return (
    <div>
      <Horizontal>
        <div className="text-2xl mb-4">{title}</div>
      </Horizontal>
      <div>{address}</div>
      <Spacer space={"small"} />
      {/* <BigText>0 ETH</BigText>
      <LittleText>$0.00 USD</LittleText> */}
      <Spacer space={"medium"} />
      <Horizontal gap>
        <WalletActionButton
          href="/faucet"
          title="Get Funds"
          icon={MdAddCircle}
          label="Faucet"
        />
        <WalletActionButton
          href="/send"
          title="Send Funds"
          icon={MdArrowCircleRight}
          label="Send"
        />
        <WalletActionButton
          href="/shield"
          title="Shield Funds"
          icon={NormalizedSunglasses}
          label="Shield"
        />
        <WalletActionButton
          href="/swap"
          title="Swap Funds"
          icon={MdSwapHorizontalCircle}
          label="Swap"
        />
      </Horizontal>
      <Vertical>
        {entries.map(([address, balance]) => {
          getTokenFromAddress(address, chainId);
          return (
            <div key={address}>
              {address}:{balance.toString()}
            </div>
          );
        })}
      </Vertical>
    </div>
  );
}

export function Profile({
  address,
  balances,
  chainId,
}: {
  address: `0x${string}` | undefined;
  balances: AccountBalances;
  chainId: number;
}) {
  return (
    <ShieldedTabs
      public={
        <ProfileLayout
          title={"Account"}
          chainId={chainId}
          address={address}
          balances={balances.publicBalances}
        />
      }
      private={
        <ProfileLayout
          title={"Private Account"}
          chainId={chainId}
          address={address}
          balances={balances.privateBalances}
        />
      }
    ></ShieldedTabs>
  );
}
