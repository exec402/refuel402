import type { Address } from "viem";

export interface Token {
  symbol: string;
  name: string;
  logoUri: string | null;
  address: Address;
  decimals: number;
}

export type NativeToken = Omit<Token, "address">;

export interface RawTokenBalance {
  token: {
    address_hash: string;
    circulating_market_cap: string | null;
    decimals: string;
    exchange_rate: string | null;
    holders_count: string;
    icon_url: string | null;
    name: string;
    symbol: string;
    total_supply: string;
    type: string;
    volume_24h: string | null;
  };
  token_id: string | null;
  value: string;
}

export interface TokenBalance {
  token: Token;
  balance: string;
}

export interface NativeTokenBalance {
  token: NativeToken;
  balance: string;
}
