import "@/lib/setupProxy";
import { blockScoutApis } from "@/lib/constants/blockScoutApis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get("address");
    const chainId = searchParams.get("chainId");

    if (!address || !chainId) {
      throw new Error("Missing parameter(s)");
    }

    const blockScoutApi = blockScoutApis[Number(chainId)];

    if (!blockScoutApi) {
      throw new Error("Unsupported chain");
    }

    const res = await fetch(
      `${blockScoutApi}/addresses/${address}/token-balances`,
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

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
          : "Unkown Error",
      success: false,
    });
  }
}
