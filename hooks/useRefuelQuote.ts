import { ethUsdcPoolFees } from "@/lib/constants";
import { getChainConfig } from "@exec402/core";
import { useReadContract } from "wagmi";
import { quoterAbi } from "@/lib/abis/quoterAbi";

function scaleAmount(
  amount: bigint,
  fromDecimals: number,
  toDecimals: number
): bigint {
  if (fromDecimals === toDecimals) return amount;

  if (fromDecimals > toDecimals) {
    return amount / BigInt(10) ** BigInt(fromDecimals - toDecimals);
  }

  return amount * BigInt(10) ** BigInt(toDecimals - fromDecimals);
}

export function useRefuelQuote({
  amountUsdc,
  amountDecimals,
  targetChainId,
}: {
  amountUsdc: bigint;
  amountDecimals: number;
  targetChainId: number;
}) {
  const chainConfig = getChainConfig(targetChainId);
  const quoter = chainConfig?.contracts.quoter;
  const usdc = chainConfig?.tokens.usdc;
  const usdcDecimals = chainConfig?.defaultAsset.decimals ?? 6;
  const weth = chainConfig?.tokens.weth;
  const poolFee = ethUsdcPoolFees[targetChainId];

  const amountIn = scaleAmount(amountUsdc, amountDecimals, usdcDecimals);

  const { data } = useReadContract({
    address: quoter,
    abi: quoterAbi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: usdc!,
        tokenOut: weth!,
        amountIn,
        fee: poolFee,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
    query: {
      enabled: amountUsdc > BigInt(0) && !!chainConfig,
    },
    chainId: targetChainId,
  });

  return { data: data?.[0] };
}
