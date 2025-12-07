import type { Token, NativeToken } from "@/types/token";
import { getChainConfig } from "@exec402/core";

export const EXEC: Token = {
  name: "Exec402 Token",
  symbol: "EXEC",
  decimals: 18,
  address: "0xa65735da8313f7e6E2F6D79A70Bf77AD39C88D42",
  logoUri: "/icons/tokens/exec.png",
};

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

export const ETH: NativeToken = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  logoUri: "/icons/tokens/eth.png",
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

export function getWeth(chainId: number): Token {
  const chainConfig = getChainConfig(chainId);
  return {
    ...TOKEN_ALIASES.weth,
    address: chainConfig?.tokens.weth ?? ("" as `0x${string}`),
  };
}

export function getDefaultTokenList(chainId: number): Token[] {
  const chainConfig = getChainConfig(chainId);
  if (!chainConfig) return [];

  return [
    EXEC,
    { ...TOKEN_ALIASES.usdc, address: chainConfig.tokens.usdc },
    { ...TOKEN_ALIASES.weth, address: chainConfig.tokens.weth },
  ];
}
