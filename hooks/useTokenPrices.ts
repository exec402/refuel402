"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import {
  getTokenPrice,
  getChainConfig,
  type TokenPriceResult,
} from "@exec402/core";
import { useCurrentChain } from "./useCurrentChain";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

export interface TokenPricesResult {
  prices: Record<string, number>;
  ethPrice: number | undefined;
  isLoading: boolean;
}

export function useTokenPrices(
  tokenAddresses: `0x${string}`[]
): TokenPricesResult {
  const currentChain = useCurrentChain();
  const chainId = currentChain?.id ?? DEFAULT_CHAIN_ID;
  const publicClient = usePublicClient({ chainId });

  const wethAddress = useMemo(() => {
    const config = getChainConfig(chainId);
    return config?.tokens.weth;
  }, [chainId]);

  const allAddresses = useMemo(() => {
    const set = new Set(tokenAddresses.map((a) => a.toLowerCase()));
    if (wethAddress) {
      set.add(wethAddress.toLowerCase());
    }
    return [...set] as `0x${string}`[];
  }, [tokenAddresses, wethAddress]);

  const queries = useQueries({
    queries: allAddresses.map((tokenAddress) => ({
      queryKey: ["token-price", chainId, tokenAddress],
      queryFn: async (): Promise<{
        address: string;
        result: TokenPriceResult | null;
      }> => {
        if (!publicClient) {
          throw new Error("Public client not available");
        }
        const result = await getTokenPrice({
          publicClient,
          chainId,
          tokenIn: tokenAddress,
        });
        return { address: tokenAddress.toLowerCase(), result };
      },
      enabled: !!publicClient,
      staleTime: 30_000, // 30 seconds
    })),
  });

  return useMemo(() => {
    const prices: Record<string, number> = {};
    let ethPrice: number | undefined;
    let isLoading = false;

    for (const query of queries) {
      if (query.isLoading) {
        isLoading = true;
      }
      if (query.data?.result) {
        const { address, result } = query.data;
        prices[address] = result.price;

        if (wethAddress && address === wethAddress.toLowerCase()) {
          ethPrice = result.price;
        }
      }
    }

    return { prices, ethPrice, isLoading };
  }, [queries, wethAddress]);
}
