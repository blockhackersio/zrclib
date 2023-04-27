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
import { ReactNode, useCallback } from "react";
import { Vertical } from "@/ui/Vertical";
import { getTokenFromAddress } from "@/contracts/get_contract";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { BigText } from "@/ui/BigText";
import { formatAmount } from "@/utils";
import { FaSadCry } from "react-icons/fa";
export function NormalizedSunglasses(p: IconBaseProps) {
  return (
    <div className={`h-${p.size} w-${p.size} p-[2px]`}>
      <BsFillEmojiSunglassesFill size={Number(p.size) - 4} />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="cursor-pointer flex flex-row" onClick={onClick}>
      <div className="flex flex-row align-middle justify-items-center">
        <AiOutlineLeft className="mt-1" />
        <div>Back</div>
      </div>
    </div>
  );
}

function AssetRow({
  setAsset,
  balance,
  address,
  token,
}: {
  token: string;
  setAsset?: (asset: string) => void;
  balance: BigNumber;
  address: string;
}) {
  const handleSetAsset = useCallback(() => {
    setAsset && setAsset(address);
  }, [address, setAsset]);

  return (
    <div
      onClick={handleSetAsset}
      className="cursor-pointer flex flex-row w-full px-2 py-4 border-b-2 justify-between"
      key={address}
    >
      <div>
        {formatAmount(balance)} {token}
      </div>
      <div>
        <AiOutlineRight />
      </div>
    </div>
  );
}

function ProfileLayout({
  isPrivate,
  address,
  title,
  balances,
  chainId,
  asset,
  setAsset,
}: {
  isPrivate: boolean;
  title: ReactNode;
  address: `0x${string}` | undefined;
  balances: Map<string, BigNumber>;
  chainId: number;
  asset: string | undefined;
  setAsset?: (asset?: string) => void;
}) {
  const entries = Array.from(balances.entries());
  const handleBackClicked = useCallback(() => {
    setAsset && setAsset();
  }, [setAsset]);

  const token = asset && getTokenFromAddress(asset, chainId);

  return (
    <div>
      {asset && <BackButton onClick={handleBackClicked} />}
      <Horizontal>
        <div className="text-2xl mb-4">{title}</div>
      </Horizontal>
      <div>{address}</div>
      <Spacer space={"small"} />
      {asset && (
        <>
          <BigText>
            {formatAmount(balances.get(asset) ?? 0)} {token}
          </BigText>
        </>
      )}
      <Spacer space={"medium"} />
      {asset && (
        <>
          <Horizontal gap>
            {!isPrivate && (
              <WalletActionButton
                href="/faucet"
                title="Get Funds"
                icon={MdAddCircle}
                label="Faucet"
              />
            )}
            <WalletActionButton
              href="/send"
              title="Send Funds"
              icon={MdArrowCircleRight}
              label="Send"
            />
            {isPrivate ? (
              <WalletActionButton
                href="/unshield"
                title="Unshield Funds"
                icon={FaSadCry}
                label={"Unshield"}
              />
            ) : (
              <WalletActionButton
                href="/shield"
                title="Shield Funds"
                icon={NormalizedSunglasses}
                label={"Shield"}
              />
            )}
            {isPrivate && (
              <WalletActionButton
                href="/swap"
                title="Swap Funds"
                icon={MdSwapHorizontalCircle}
                label="Swap"
              />
            )}
          </Horizontal>
          <Spacer space="large" />
        </>
      )}

      {!asset && (
        <Vertical className="border-t-2">
          {entries.map(([address, balance]) => {
            const token = getTokenFromAddress(address, chainId);
            if (!token) return;
            return (
              <AssetRow
                address={address}
                balance={balance}
                setAsset={setAsset}
                token={token}
                key={token}
              />
            );
          })}
        </Vertical>
      )}
    </div>
  );
}

export function Profile({
  address,
  balances,
  chainId,
  asset,
  setAsset,
}: {
  address: `0x${string}` | undefined;
  balances: AccountBalances;
  chainId: number;
  asset: string | undefined;
  setAsset: (asset?: string) => void;
}) {
  return (
    <ShieldedTabs
      public={
        <ProfileLayout
          isPrivate={false}
          asset={asset}
          title={"Public Account"}
          chainId={chainId}
          address={address}
          balances={balances.publicBalances}
          setAsset={setAsset}
        />
      }
      private={
        <ProfileLayout
          isPrivate={true}
          asset={asset}
          title={"Private Account"}
          chainId={chainId}
          address={address}
          balances={balances.privateBalances}
          setAsset={setAsset}
        />
      }
    ></ShieldedTabs>
  );
}
