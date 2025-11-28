import type { Token, NativeToken } from "@/types/token";

import { ADDRESS_MAP } from "./addresses";

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
  return {
    ...TOKEN_ALIASES.usdc,
    address: ADDRESS_MAP[chainId]?.usdc,
  };
}

export function getWeth(chainId: number): Token {
  return {
    ...TOKEN_ALIASES.weth,
    address: ADDRESS_MAP[chainId]?.weth,
  };
}

export function getDefaultTokenList(chainId: number): Token[] {
  const addresses = ADDRESS_MAP[chainId];
  if (!addresses) return [];

  return [
    EXEC,
    { ...TOKEN_ALIASES.usdc, address: addresses.usdc },
    { ...TOKEN_ALIASES.weth, address: addresses.weth },
  ];
}
