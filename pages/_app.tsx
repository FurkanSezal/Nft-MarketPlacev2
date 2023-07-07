import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";

import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai, goerli, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { localHost } from "../localnode";
import { NotificationProvider } from "@web3uikit/core";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/49360/sepolia_dashone/version/latest",
});

const apikey: string = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, polygonMumbai, localHost],
  [alchemyProvider({ apiKey: apikey }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "dashOne",
  projectId: "491b125a2c55325ef23f2c11955ff58f",
  chains,
});

const wagmiConfig = createConfig({
  connectors,
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <NotificationProvider>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
          </ApolloProvider>
        </NotificationProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
