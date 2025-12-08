import { alchemyApis } from "@/lib/constants/alchemyApi";
import { blockScoutApis } from "@/lib/constants/blockScoutApis";
import { getDefaultTokenList } from "@/lib/constants/tokens";
import { NextRequest, NextResponse } from "next/server";

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

interface AlchemyResponse {
  jsonrpc: string;
  id: number;
  result: {
    address: string;
    tokenBalances: AlchemyTokenBalance[];
  };
}

interface BlockScoutToken {
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
}

const ZERO_BALANCE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get("address");
    const chainId = searchParams.get("chainId");

    if (!address || !chainId) {
      throw new Error("Missing parameter(s)");
    }

    const numericChainId = Number(chainId);
    const alchemyApi = alchemyApis[numericChainId];
    const blockScoutApi = blockScoutApis[numericChainId];

    if (!alchemyApi) {
      throw new Error("Unsupported chain");
    }

    const balancesRes = await fetch(alchemyApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [address, "erc20"],
      }),
      cache: "no-store",
    });

    const balancesData: AlchemyResponse = await balancesRes.json();

    const nonZeroBalances = balancesData.result.tokenBalances.filter(
      (t) => t.tokenBalance !== ZERO_BALANCE
    );

    if (nonZeroBalances.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    let data;

    if (blockScoutApi) {
      const tokenInfoPromises = nonZeroBalances.map(async (t) => {
        const res = await fetch(
          `${blockScoutApi}/tokens/${t.contractAddress}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          return null;
        }
        return res.json() as Promise<BlockScoutToken>;
      });

      const tokenInfos = await Promise.all(tokenInfoPromises);

      data = nonZeroBalances
        .map((balance, index) => {
          if (!tokenInfos[index]) return null;
          return {
            token: tokenInfos[index],
            token_id: null,
            value: BigInt(balance.tokenBalance).toString(),
          };
        })
        .filter(
          (
            x
          ): x is {
            token: BlockScoutToken;
            token_id: null;
            value: string;
          } => x !== null
        );
    } else {
      const defaultTokens = getDefaultTokenList(numericChainId);

      data = nonZeroBalances
        .map((balance) => {
          const token = defaultTokens.find(
            (t) =>
              t.address.toLowerCase() ===
              balance.contractAddress.toLowerCase()
          );

          if (!token) {
            return null;
          }

          const synthesizedToken: BlockScoutToken = {
            address_hash: token.address,
            circulating_market_cap: null,
            decimals: token.decimals.toString(),
            exchange_rate: null,
            holders_count: "0",
            icon_url: token.logoUri,
            name: token.name,
            symbol: token.symbol,
            total_supply: "0",
            type: "ERC-20",
            volume_24h: null,
          };

          return {
            token: synthesizedToken,
            token_id: null,
            value: BigInt(balance.tokenBalance).toString(),
          };
        })
        .filter(
          (
            x
          ): x is {
            token: BlockScoutToken;
            token_id: null;
            value: string;
          } => x !== null
        );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      error:
        error instanceof Error
          ? error.message || error.toString()
          : "Unknown Error",
      success: false,
    });
  }
}
