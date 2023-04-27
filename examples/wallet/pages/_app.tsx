import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { mainnet, localhost } from "wagmi/chains";
import { Flowbite } from "flowbite-react";
import { theme } from "../styles/theme";
import { ShieldedProvider } from "@/components/ShieldedMode";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { LayoutContext, PlainLayout } from "@/ui/LayoutProvider";
import { ZrclibProvider } from "@/components/providers/ZrclibProvider";
const { chains, provider } = configureChains(
  [mainnet, { ...localhost, id: 31337 }],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

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
      <RainbowKitProvider theme={midnightTheme()} chains={chains}>
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
