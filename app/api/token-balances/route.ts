import { alchemyApis } from "@/lib/constants/alchemyApi";
import { blockScoutApis } from "@/lib/constants/blockScoutApis";
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

    const alchemyApi = alchemyApis[Number(chainId)];
    const blockScoutApi = blockScoutApis[Number(chainId)];

    if (!alchemyApi || !blockScoutApi) {
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

    const tokenInfoPromises = nonZeroBalances.map((t) =>
      fetch(`${blockScoutApi}/tokens/${t.contractAddress}`, {
        cache: "no-store",
      }).then((res) => res.json() as Promise<BlockScoutToken>)
    );

    const tokenInfos = await Promise.all(tokenInfoPromises);

    const data = nonZeroBalances.map((balance, index) => ({
      token: tokenInfos[index],
      token_id: null,
      value: BigInt(balance.tokenBalance).toString(),
    }));

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
