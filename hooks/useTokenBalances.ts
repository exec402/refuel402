import { useQuery } from "@tanstack/react-query";
import { useCurrentChain } from "./useCurrentChain";
import {
  RawTokenBalance,
  TokenBalance,
  Token,
  NativeToken,
  NativeTokenBalance,
} from "@/types/token";
import { useAccount, useBalance } from "wagmi";
import { useMemo } from "react";
import { ETH, getDefaultTokenList } from "@/lib/constants/tokens";

import { isSameAddress } from "@/lib/utils/common";

export function useTokenBalances({ chainId }: { chainId?: number } = {}) {
  const { address } = useAccount();
  const currentChain = useCurrentChain();

  const defaultTokenList = useMemo(() => {
    return currentChain ? getDefaultTokenList(currentChain.id) : [];
  }, [currentChain]);

  return useQuery({
    queryKey: ["token-balances", address, currentChain?.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/token-balances?address=${address}&chainId=${
          chainId ?? currentChain?.id
        }`
      );
      const data = (await res.json()) as { data: RawTokenBalance[] };

      return data.data.map((raw) => {
        const token = defaultTokenList.find((token) =>
          isSameAddress(token.address, raw.token.address_hash)
        );
        if (token) {
          return {
            token,
            balance: raw.value,
          };
        }
        return {
          token: {
            symbol: raw.token.symbol,
            name: raw.token.name,
            logoUri: raw.token.icon_url,
            address: raw.token.address_hash as `0x${string}`,
            decimals: Number(raw.token.decimals),
          },
          balance: raw.value,
        };
      }) as TokenBalance[];
    },
    enabled: !!address && !!currentChain,
    refetchInterval: 5000,
  });
}

export function useTokenBalance(
  token: Token | NativeToken | undefined,
  chainId?: number
): TokenBalance | NativeTokenBalance | undefined {
  const { address } = useAccount();
  const { data: balances } = useTokenBalances();
  const { data: nativeBalance } = useBalance({
    address,
    chainId,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  return useMemo(() => {
    if (!token) {
      return undefined;
    }
    if (!("address" in token)) {
      return nativeBalance
        ? ({
            token: ETH,
            balance: nativeBalance.value.toString(),
          } as NativeTokenBalance)
        : undefined;
    }

    return balances !== undefined
      ? ((balances?.find((balance) =>
          isSameAddress(balance.token.address, token.address)
        ) ?? {
          token,
          balance: "0",
        }) as TokenBalance)
      : undefined;
  }, [balances, nativeBalance, token]);
}
