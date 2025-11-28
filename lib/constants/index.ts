import { baseSepolia, optimismSepolia } from "wagmi/chains";
import { Address } from "viem";

export const DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? "84532"
);

export const CANISTER_ID = process.env.NEXT_PUBLIC_CANISTER_ID ?? "";
export const CANISTER_URL = `https://${CANISTER_ID}.icp0.io`;

export const INTEGRATOR_ADDRESS =
  process.env.NEXT_PUBLIC_INTEGRATOR_ADDRESS ?? "";

export const EXEC_CORE_ADDRESS = (process.env.NEXT_PUBLIC_EXEC_CORE_ADDRESS ??
  "") as Address;

export const SPOKE_POOL_ADDRESS = (process.env.NEXT_PUBLIC_SPOKE_POOL_ADDRESS ??
  "") as Address;

export const FEE_POOL_ADDRESS = (process.env.NEXT_PUBLIC_FEE_POOL_ADDRESS ??
  "") as Address;

export const MINTER_ADDRESS = (process.env.NEXT_PUBLIC_MINTER_ADDRESS ??
  "") as Address;

export * from "./addresses";
export * from "./chains";

export const ethUsdcPoolFees: Record<number, number> = {
  [baseSepolia.id]: 3000,
  [optimismSepolia.id]: 500,
};

export const EXEC_REWARD_PER_USDC = 1000;
