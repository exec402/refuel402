import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  injected,
} from "wagmi";
import { SUPPORTED_CHAINS, SupportedChainId } from "@/lib/constants";
import type { HttpTransport } from "viem";

const transports: Record<SupportedChainId, HttpTransport> = Object.fromEntries(
  SUPPORTED_CHAINS.map((chain) => [chain.id, http()])
) as Record<SupportedChainId, HttpTransport>;

export const baseWagmiConfig = {
  chains: SUPPORTED_CHAINS,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports,
  connectors: [injected()],
  ssr: true,
} as const;

export const getServerConfig = () =>
  createConfig({
    ...baseWagmiConfig,
  });
