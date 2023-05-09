import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  midnightTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { mainnet, localhost, polygonZkEvmTestnet } from "wagmi/chains";
import { mantle } from "../components/providers/MantleTestnet";
import { Flowbite } from "flowbite-react";
import { theme } from "../styles/theme";
import { ShieldedProvider } from "@/components/ShieldedMode";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { LayoutContext, PlainLayout } from "@/ui/LayoutProvider";
import { ZrclibProvider } from "@/components/providers/ZrclibProvider";
const { chains, provider } = configureChains(
  [mainnet, { ...mantle, iconUrl: '/mantle.jpg'}, { ...polygonZkEvmTestnet, iconUrl: '/polygon.png'}, { ...localhost, id: 31337 }],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [injectedWallet({ chains }), metaMaskWallet({ chains })],
  },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});
let prefetched = false;
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    if (prefetched) return;
    console.log("Prefetching...");
    router.prefetch("/faucet");
    router.prefetch("/send");
    router.prefetch("/shield");
    router.prefetch("/swap");
    console.log("Done!");
    prefetched = true;
  }, [router]);
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={midnightTheme({
          accentColor: "#ffffff",
          accentColorForeground: "#000000",
          borderRadius: "small",
          fontStack: "system",
        })}
        chains={chains}
      >
        <Flowbite theme={{ theme }}>
          <ShieldedProvider>
            <LayoutContext.Provider value={PlainLayout}>
              <ZrclibProvider>
                <Component {...pageProps} />
              </ZrclibProvider>
            </LayoutContext.Provider>
          </ShieldedProvider>
        </Flowbite>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
