import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatUnits, parseEther } from "viem";
import { ADDRESS_MAP, ethUsdcPoolFees, CHAIN_MAP } from "@/lib/constants";
import { quoterAbi } from "@/lib/abis/quoterAbi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const chainId = Number(searchParams.get("chainId"));

  if (!token || !chainId) {
    return NextResponse.json(
      { error: "Missing token or chainId" },
      { status: 400 }
    );
  }

  const chain = CHAIN_MAP[chainId];
  const addresses = ADDRESS_MAP[chainId];

  if (!chain || !addresses) {
    return NextResponse.json(
      { error: "Unsupported chainId" },
      { status: 400 }
    );
  }

  if (token.toLowerCase() === addresses.usdc.toLowerCase()) {
    return NextResponse.json({ price: 1 });
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const poolFee = ethUsdcPoolFees[chainId] ?? 3000;

  try {
    const [amountOut] = (await publicClient.readContract({
      address: addresses.quoter,
      abi: quoterAbi,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn: token as `0x${string}`,
          tokenOut: addresses.usdc,
          amountIn: parseEther("0.0001"),
          fee: poolFee,
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    })) as [bigint, bigint, number, bigint];

    const price = Number(formatUnits(amountOut, 6)) * 10000;

    return NextResponse.json({ price });
  } catch (error) {
    console.error("Error fetching price:", error);
    return NextResponse.json({ price: 0 });
  }
}