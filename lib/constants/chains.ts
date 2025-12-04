import { baseSepolia, optimismSepolia, base } from "wagmi/chains";
import type { Chain } from "viem";

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? "testnet";

export const DEFAULT_CHAIN_ID = Number(
  NETWORK === "mainnet" ? "8453" : "84532"
);

export const SUPPORTED_CHAINS =
  NETWORK === "mainnet" ? [base] : ([baseSepolia, optimismSepolia] as const);

export const CHAIN_MAP: Record<number, Chain> = Object.fromEntries(
  SUPPORTED_CHAINS.map((chain) => [chain.id, chain])
);

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];
