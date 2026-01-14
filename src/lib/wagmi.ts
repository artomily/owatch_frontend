import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle, mantleTestnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "O'Watch.ID",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "2f05a7c0a2b0e1a2c8e3b4c5d6e7f8a9", // Get this from https://cloud.walletconnect.com
  chains: [mantle, mantleTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
