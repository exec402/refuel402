import { ethUsdcPoolFees, ADDRESS_MAP } from "@/lib/constants";
import { useReadContract } from "wagmi";
import { quoterAbi } from "@/lib/abis/quoterAbi";

export function useRefuelQuote({
  amountUsdc,
  targetChainId,
}: {
  amountUsdc: bigint;
  targetChainId: number;
}) {
  const { quoter, usdc, weth } = ADDRESS_MAP[targetChainId];
  const poolFee = ethUsdcPoolFees[targetChainId];

  const { data, error } = useReadContract({
    address: quoter,
    abi: quoterAbi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: usdc,
        tokenOut: weth,
        amountIn: amountUsdc,
        fee: poolFee,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
    query: {
      enabled: amountUsdc > BigInt(0),
    },
  });
  console.log(error, quoter, poolFee);
  return { data: data?.[0] };
}
