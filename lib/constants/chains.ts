import { baseSepolia, optimismSepolia } from "wagmi/chains";
import type { Chain } from "viem";

export const SUPPORTED_CHAINS = [baseSepolia, optimismSepolia] as const;

export const CHAIN_MAP: Record<number, Chain> = Object.fromEntries(
  SUPPORTED_CHAINS.map((chain) => [chain.id, chain])
);

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];
