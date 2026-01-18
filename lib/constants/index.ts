import { baseSepolia, optimismSepolia, bscTestnet, base, optimism, bsc, xLayer } from "wagmi/chains";

export const REFERRER_ADDRESS = process.env.NEXT_PUBLIC_REFERRER_ADDRESS ?? "";

export * from "./chains";

export const ethUsdcPoolFees: Record<number, number> = {
  [baseSepolia.id]: 3000,
  [optimismSepolia.id]: 500,
  [bscTestnet.id]: 500,
  [base.id]: 500,
  [optimism.id]: 500,
  [bsc.id]: 100,
  [xLayer.id]: 500,
};

export const EXEC_REWARD_PER_USDC = 100;
