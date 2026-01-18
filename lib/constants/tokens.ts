import type { Token, NativeToken } from "@/types/token";
import { getChainConfig } from "@exec402/core";
import { bsc, bscTestnet, xLayer } from "wagmi/chains";

export const TOKEN_ALIASES = {
  usdc: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoUri: "/icons/tokens/usdc.png",
  },
  weth: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    logoUri: "/icons/tokens/weth.png",
  },
};

export const BSC_USD1: Token = {
  name: "World Liberty Financial USD",
  symbol: "USD1",
  decimals: 18,
  logoUri: "/icons/tokens/usd1.webp",
  address: "0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d",
};

export function getUsdc(chainId: number): Token {
  const chainConfig = getChainConfig(chainId);
  return {
    ...TOKEN_ALIASES.usdc,
    address: chainConfig?.tokens.usdc ?? ("" as `0x${string}`),
    symbol: chainConfig?.defaultAsset.name ?? TOKEN_ALIASES.usdc.symbol,
    decimals: chainConfig?.defaultAsset.decimals ?? TOKEN_ALIASES.usdc.decimals,
  };
}

export function getEth(chainId: number | undefined): NativeToken {
  return chainId === bsc.id || chainId === bscTestnet.id
    ? {
        decimals: 18,
        symbol: "BNB",
        name: "Binance Coin",
        logoUri: "/icons/tokens/bnb.png",
      }
    : chainId === xLayer.id
      ? {
          decimals: 18,
          symbol: "OKB",
          name: "OKB",
          logoUri: "/icons/tokens/okb.png",
        }
      : {
          decimals: 18,
          symbol: "ETH",
          name: "Ethereum",
          logoUri: "/icons/tokens/eth.png",
        };
}

export function getWeth(chainId: number): Token {
  const chainConfig = getChainConfig(chainId);
  return {
    ...TOKEN_ALIASES.weth,
    address: chainConfig?.tokens.weth ?? ("" as `0x${string}`),
    symbol:
      chainId === bsc.id || chainId === bscTestnet.id
        ? "WBNB"
        : chainId === xLayer.id
          ? "WOKB"
          : "WETH",
    name:
      chainId === bsc.id || chainId === bscTestnet.id
        ? "Wrapped Binance Coin"
        : chainId === xLayer.id
          ? "Wrapped OKB"
        : "Wrapped Ether",
    logoUri:
      chainId === bsc.id || chainId === bscTestnet.id
        ? "/icons/tokens/wbnb.png"
        : chainId === xLayer.id
          ? "/icons/tokens/wokb.png"
        : "/icons/tokens/weth.png",
  };
}

export function getDefaultTokenList(chainId: number): Token[] {
  const chainConfig = getChainConfig(chainId);
  if (!chainConfig) return [];

  const tokens: Token[] = [
    {
      ...TOKEN_ALIASES.usdc,
      address: chainConfig.tokens.usdc,
      symbol: chainConfig.defaultAsset.name,
      decimals: chainConfig.defaultAsset.decimals,
    },
    { ...TOKEN_ALIASES.weth, address: chainConfig.tokens.weth },
  ];

  if (chainId === 56) {
    tokens.push(BSC_USD1);
  }

  return tokens;
}
