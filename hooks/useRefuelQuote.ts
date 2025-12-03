import { ethUsdcPoolFees } from "@/lib/constants";
import { getChainConfig } from "@exec402/core";
import { useReadContract } from "wagmi";
import { quoterAbi } from "@/lib/abis/quoterAbi";

export function useRefuelQuote({
  amountUsdc,
  targetChainId,
}: {
  amountUsdc: bigint;
  targetChainId: number;
}) {
  const chainConfig = getChainConfig(targetChainId);
  const quoter = chainConfig?.contracts.quoter;
  const usdc = chainConfig?.tokens.usdc;
  const weth = chainConfig?.tokens.weth;
  const poolFee = ethUsdcPoolFees[targetChainId];

  const { data, error } = useReadContract({
    address: quoter,
    abi: quoterAbi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: usdc!,
        tokenOut: weth!,
        amountIn: amountUsdc,
        fee: poolFee,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
    query: {
      enabled: amountUsdc > BigInt(0) && !!chainConfig,
    },
  });
  console.log(error, quoter, poolFee);
  return { data: data?.[0] };
}
