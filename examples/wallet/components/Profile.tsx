import { Button, IconButton } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import {
  MdSwapHorizontalCircle,
  MdAddCircle,
  MdArrowCircleRight,
  MdExitToApp,
} from "react-icons/md";
import { BigText } from "@/ui/BigText";
import { LittleText } from "@/ui/LittleText";
import { WalletActionButton } from "@/ui/WalletActionButton";
import { Spacer } from "@/ui/Spacer";
import { IconBaseProps } from "react-icons";
import { BsFillEmojiSunglassesFill } from "react-icons/bs";
import { ShieldedTabs } from "./ShieldedMode";
export function NormalizedSunglasses(p: IconBaseProps) {
  return (
    <div className={`h-${p.size} w-${p.size} p-[2px]`}>
      <BsFillEmojiSunglassesFill size={Number(p.size) - 4} />
    </div>
  );
}

export function Profile({ address }: { address: `0x${string}` | undefined }) {
  return (
    <ShieldedTabs
      public={
        <>
          {" "}
          <Horizontal>
            <div className="text-2xl mb-4">My Account</div>
          </Horizontal>
          <div>{address}</div>
          <Spacer space={"small"} />
          <BigText>0 ETH</BigText>
          <LittleText>$0.00 USD</LittleText>
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
        </>
      }
      private={
        <>
          <Horizontal>
            <div className="text-2xl mb-4">My Account</div>
          </Horizontal>
          <div>{address}</div>
          <Spacer space={"small"} />
          <BigText>0 ETH</BigText>
          <LittleText>$0.00 USD</LittleText>
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
        </>
      }
    ></ShieldedTabs>
  );
}
