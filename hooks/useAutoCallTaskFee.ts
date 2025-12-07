import { usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { getChainConfig } from "@exec402/core";
import { useCurrentChain } from "./useCurrentChain";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentChainTokenPrice } from "./useCurrentChainTokenPrice";

export function useMockCallTxFeeEth({
  target,
  data,
}: {
  target: string;
  data: string;
}) {
  const publicClient = usePublicClient();
  const currentChain = useCurrentChain();
  const chainConfig = currentChain
    ? getChainConfig(currentChain.id)
    : undefined;
  const execCoreAddress = chainConfig?.contracts.execCore;

  const fallbackTxFee = currentChain?.id === 56 ? 0.000007 : 0.0000006;

  return useQuery({
    queryKey: ["txFee", target, data, execCoreAddress],
    queryFn: async () => {
      if (!publicClient || !execCoreAddress) return fallbackTxFee;

      try {
        const targetGas = await publicClient.estimateGas({
          to: target as `0x${string}`,
          data: data as `0x${string}`,
          account: execCoreAddress,
        });

        const overhead = BigInt(290_000);
        const totalGas = targetGas + overhead;

        console.log("totalGas", totalGas);

        const gasPrice = await publicClient.getGasPrice();
        const fee = totalGas * (gasPrice || BigInt(0));

        return Number(formatEther(fee));
      } catch (error) {
        console.log(error);
        return fallbackTxFee;
      }
    },
    enabled: !!execCoreAddress,
    staleTime: 30_000,
  });
}

export function useAutoCallTaskFee({
  target,
  data,
}: {
  target: string;
  data: string;
}) {
  const ethPrice = useCurrentChainTokenPrice();

  const { data: txFeeEth } = useMockCallTxFeeEth({ target, data });

  return useMemo(() => {
    return ethPrice && txFeeEth ? txFeeEth * ethPrice * 3 : undefined;
  }, [ethPrice, txFeeEth]);
}
