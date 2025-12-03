import { useCurrentChain } from "./useCurrentChain";
import { useTokenPrice } from "@exec402/react";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

export function useCurrentChainTokenPrice(tokenAddress?: `0x${string}`) {
  const currentChain = useCurrentChain();
  const { data } = useTokenPrice({
    chainId: currentChain?.id ?? DEFAULT_CHAIN_ID,
    tokenAddress,
  });

  return data?.price;
}
