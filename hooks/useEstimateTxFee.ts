import { useGasPrice, useEstimateGas, usePublicClient } from "wagmi";
import { encodeFunctionData, formatEther } from "viem";
import { execCoreAbi } from "@/lib/abis/execCoreAbi";
import { EXEC_CORE_ADDRESS } from "@/lib/constants";
import type { Task } from "@/types/task";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useEthPrice } from "./usePrices";
import { permitTypeToUint8 } from "@/lib/utils/task";

export function useEstimateTxFee(task: Task) {
  const { data: gasPrice } = useGasPrice();

  const payloadJson = JSON.parse(task.payload);

  const { data: ethPrice } = useEthPrice();

  const { data: gasEstimate } = useEstimateGas({
    to: EXEC_CORE_ADDRESS as `0x${string}`,
    data: encodeFunctionData({
      abi: execCoreAbi,
      functionName: "call",
      args: [
        task.taskId as `0x${string}`,
        payloadJson.token,
        payloadJson.target,
        payloadJson.data,
        BigInt(payloadJson.amount),
        payloadJson.initiator,
        payloadJson.integrator,
        payloadJson.fee,
        {
          permitType: permitTypeToUint8(payloadJson.permit.permitType),
          permitParams: payloadJson.permit.permitParams,
          signature: payloadJson.permit.signature,
        },
        (task.attestorSignature || "0x") as `0x${string}`,
      ],
    }),
    query: {
      enabled: !!task.attestorSignature,
    },
  });

  const estimatedFee =
    gasEstimate && gasPrice ? gasEstimate * gasPrice : undefined;

  const estimatedFeeInEth = estimatedFee
    ? formatEther(estimatedFee)
    : undefined;

  return useMemo(() => {
    return ethPrice && estimatedFeeInEth
      ? Number(estimatedFeeInEth) * ethPrice
      : undefined;
  }, [ethPrice, estimatedFeeInEth]);
}

export function useMockCallTxFeeEth({
  target,
  data,
}: {
  target: string;
  data: string;
}) {
  const publicClient = usePublicClient();

  const fallbackTxFee = 0.0000004;

  return useQuery({
    queryKey: ["txFee", target, data],
    queryFn: async () => {
      if (!publicClient) return fallbackTxFee;

      try {
        const targetGas = await publicClient.estimateGas({
          to: target as `0x${string}`,
          data: data as `0x${string}`,
          account: EXEC_CORE_ADDRESS as `0x${string}`,
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
  const { data: ethPrice } = useEthPrice();
  const { data: txFeeEth } = useMockCallTxFeeEth({ target, data });

  return useMemo(() => {
    return ethPrice && txFeeEth ? txFeeEth * ethPrice * 1.5 : undefined;
  }, [ethPrice, txFeeEth]);
}
