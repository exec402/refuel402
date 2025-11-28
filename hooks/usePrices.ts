"use client";

import { useQuery } from "@tanstack/react-query";
import { ADDRESS_MAP } from "@/lib/constants";

import type { NativeToken, Token } from "@/types/token";
import { useCurrentChain } from "./useCurrentChain";
import { useWeth } from "./useToken";

export function useTokenPrice(token: Token | NativeToken | undefined) {
  const currentChain = useCurrentChain();
  const chainId = currentChain?.id;

  const tokenAddress =
    token && !("address" in token)
      ? ADDRESS_MAP[chainId ?? 0]?.weth
      : token?.address ?? "";

  return useQuery<number>({
    queryKey: ["tokenPrice", tokenAddress, chainId],
    queryFn: async () => {
      if (!chainId || !tokenAddress) {
        return 0;
      }

      const res = await fetch(
        `/api/prices?token=${tokenAddress}&chainId=${chainId}`
      );
      const data = await res.json();

      return data.price ?? 0;
    },
    enabled: !!chainId && !!tokenAddress,
    staleTime: 30_000,
  });
}

export function useEthPrice() {
  const weth = useWeth();
  return useTokenPrice(weth);
}
