import {
  buildApproveCall,
  buildTransferFromCall,
  buildUniswapV3SwapCall,
  buildMakeCallWithBalanceCall,
  buildDistributeTokenEvenlyCall,
  buildMulticallMessage,
  buildDepositV3Call,
  type Call,
} from "@exec402/core";
import { encodeFunctionData, parseUnits, type Address } from "viem";
import { ethUsdcPoolFees, NETWORK } from "@/lib/constants";
import {
  getChainConfig,
  getAcrossQuote,
  type AcrossQuote,
  type ExecNetwork,
} from "@exec402/core";

export function buildRefuelMessage(
  initiator: Address,
  amountUsdc: bigint,
  recipients: Address[],
  sourceChainId: number,
  targetChainId: number,
  minEthOut = "0",
  extraCalls: Call[] = [],
  amountUsdcOverride?: bigint,
  poolFeeOverride?: number,
  usdcOverride?: Address
) {
  const targetChainConfig = getChainConfig(targetChainId);
  if (!targetChainConfig) {
    throw new Error(`Unsupported target chain: ${targetChainId}`);
  }

  const { usdc: defaultUsdc, weth } = targetChainConfig.tokens;
  const { swapRouter, multicallHandler, execCore } =
    targetChainConfig.contracts;

  const usdc = usdcOverride ?? defaultUsdc;

  const amountUsdcBigInt =
    amountUsdcOverride !== undefined ? amountUsdcOverride : amountUsdc;
  const minEthOutBigInt = parseUnits(minEthOut, 18);

  const poolFee = poolFeeOverride ?? ethUsdcPoolFees[targetChainId];

  const calls: Call[] = [];

  const isCrossChain = targetChainId !== sourceChainId;

  if (!isCrossChain) {
    calls.push(
      buildTransferFromCall({
        token: usdc,
        from: execCore,
        to: multicallHandler,
        amount: amountUsdcBigInt,
      })
    );
  }

  // Call 0: Approve USDC to SwapRouter
  calls.push(
    buildApproveCall({
      token: usdc,
      spender: swapRouter,
      amount: BigInt(2) ** BigInt(256) - BigInt(1),
    })
  );

  // Call 1: Swap USDC → WETH
  calls.push(
    buildUniswapV3SwapCall({
      router: swapRouter,
      tokenIn: usdc,
      tokenOut: weth,
      fee: poolFee,
      recipient: multicallHandler,
      amountIn: amountUsdcBigInt,
      amountOutMinimum: minEthOutBigInt,
      sqrtPriceLimitX96: BigInt(0),
    })
  );

  // Call 2: Unwrap WETH → ETH
  const withdrawCalldata = encodeFunctionData({
    abi: [
      {
        name: "withdraw",
        type: "function",
        inputs: [{ name: "wad", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "withdraw",
    args: [BigInt(0)],
  });

  const replacements = [
    {
      token: weth,
      offset: BigInt(4), // after 4-byte selector
    },
  ];

  calls.push(
    buildMakeCallWithBalanceCall({
      multicallHandler,
      target: weth,
      callData: withdrawCalldata,
      value: BigInt(0),
      replacements,
    })
  );

  // Call 3: Distribute ETH evenly to all recipients
  // Uses distributeTokenEvenly because we don't know the exact ETH amount in advance
  calls.push(
    buildDistributeTokenEvenlyCall({
      multicallHandler,
      token: "0x0000000000000000000000000000000000000000",
      recipients,
    })
  );

  // Add extra calls (e.g., mint call for same-chain refuel)
  calls.push(...extraCalls);

  const message = buildMulticallMessage(calls, initiator);

  return message;
}

export async function getRefuelData(
  initiator: Address,
  token: Address,
  amountBigInt: bigint,
  recipients: Address[],
  sourceChainId: number,
  targetChainId: number,
  minEthOut = "0",
  poolFee?: number
) {
  const sourceChainConfig = getChainConfig(sourceChainId);
  if (!sourceChainConfig) {
    return undefined;
  }

  const sourceMulticallHandler = sourceChainConfig.contracts.multicallHandler;
  const sourceExecCore = sourceChainConfig.contracts.execCore;
  const sourceSpokePool = sourceChainConfig.contracts.spokePool;

  const targetChainConfig = getChainConfig(targetChainId);
  if (!targetChainConfig) {
    return undefined;
  }

  const destMulticallHandler = targetChainConfig.contracts.multicallHandler;
  const destToken = targetChainConfig.tokens.usdc;

  const isCrossChain = targetChainId !== sourceChainId;

  // Build mint call if from DEFAULT_CHAIN_ID
  // const mintCall =
  //   sourceChainId === DEFAULT_CHAIN_ID
  //     ? buildCall(
  //         MINTER_ADDRESS,
  //         encodeFunctionData({
  //           abi: minterAbi,
  //           functionName: "mintFor",
  //           args: [initiator],
  //         })
  //       )
  //     : null;
  const mintCall = null;

  if (!isCrossChain) {
    const extraCalls: Call[] = mintCall ? [mintCall] : [];
    const refuelMessage = buildRefuelMessage(
      initiator,
      amountBigInt,
      recipients,
      sourceChainId,
      targetChainId,
      minEthOut,
      extraCalls,
      undefined,
      poolFee,
      token
    );

    const data = encodeFunctionData({
      abi: [
        {
          name: "handleMessage",
          type: "function",
          inputs: [
            { name: "token", type: "address" },
            { name: "message", type: "bytes" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "handleMessage",
      args: [token, refuelMessage],
    });

    return {
      target: sourceMulticallHandler,
      data,
    };
  }

  // For cross-chain refuel
  // Across will send `outputAmount` (after fees) to the destination.
  // We must swap exactly that amount, otherwise the swap will revert
  // due to insufficient balance on the MulticallHandler.

  let acrossQuote: AcrossQuote | null = null;

  if (isCrossChain) {
    acrossQuote = await getAcrossQuote({
      amount: amountBigInt,
      inputToken: token,
      outputToken: destToken,
      sourceChainId,
      targetChainId,
      network: NETWORK as ExecNetwork,
    }).catch(() => {
      return null;
    });
    if (!acrossQuote) {
      return undefined;
    }
  }

  const usdcForSwap =
    acrossQuote && acrossQuote.outputAmount > BigInt(0)
      ? acrossQuote.outputAmount
      : amountBigInt;

  const refuelMessage = buildRefuelMessage(
    initiator,
    amountBigInt,
    recipients,
    sourceChainId,
    targetChainId,
    minEthOut,
    [],
    usdcForSwap,
    poolFee
  );

  const outputAmount = acrossQuote ? acrossQuote.outputAmount : amountBigInt;
  const quoteTimestamp = acrossQuote
    ? acrossQuote.quoteTimestamp
    : Math.floor(Date.now() / 1000);

  const fillDeadline = acrossQuote
    ? acrossQuote.fillDeadline
    : Math.floor(Date.now() / 1000) + 4 * 3600;

  const exclusivityDeadline = acrossQuote ? acrossQuote.exclusivityDeadline : 0;
  const exclusiveRelayer = acrossQuote
    ? acrossQuote.exclusiveRelayer
    : "0x0000000000000000000000000000000000000000";

  // If no mint needed, call depositV3 directly (depositor = ExecCore)
  if (!mintCall) {
    const depositV3Data = encodeFunctionData({
      abi: [
        {
          name: "depositV3",
          type: "function",
          inputs: [
            { name: "depositor", type: "address" },
            { name: "recipient", type: "address" },
            { name: "inputToken", type: "address" },
            { name: "outputToken", type: "address" },
            { name: "inputAmount", type: "uint256" },
            { name: "outputAmount", type: "uint256" },
            { name: "destinationChainId", type: "uint256" },
            { name: "exclusiveRelayer", type: "address" },
            { name: "quoteTimestamp", type: "uint32" },
            { name: "fillDeadline", type: "uint32" },
            { name: "exclusivityDeadline", type: "uint32" },
            { name: "message", type: "bytes" },
          ],
          outputs: [],
          stateMutability: "payable",
        },
      ],
      functionName: "depositV3",
      args: [
        sourceExecCore, // depositor
        destMulticallHandler,
        token, // inputToken
        destToken, // outputToken
        amountBigInt, // inputAmount
        outputAmount, // outputAmount
        BigInt(targetChainId), // destinationChainId
        exclusiveRelayer,
        quoteTimestamp, // quoteTimestamp
        fillDeadline, // fillDeadline
        exclusivityDeadline, // exclusivityDeadline
        refuelMessage, // message
      ],
    });

    return {
      target: sourceSpokePool,
      data: depositV3Data,
    };
  }

  // Cross-chain + mint needed: use multicall
  // 1. transferFrom ExecCore to MulticallHandler
  // 2. approve SpokePool
  // 3. depositV3 (depositor = MulticallHandler)
  // 4. mintFor
  const calls: Call[] = [
    // Transfer USDC from ExecCore to MulticallHandler
    buildTransferFromCall({
      token,
      from: sourceExecCore,
      to: sourceMulticallHandler,
      amount: amountBigInt,
    }),

    // Approve SpokePool to spend USDC
    buildApproveCall({
      token,
      spender: sourceSpokePool,
      amount: amountBigInt,
    }),
    // depositV3 with depositor = MulticallHandler
    buildDepositV3Call({
      spokePool: sourceSpokePool,
      depositor: sourceSpokePool,
      recipient: sourceMulticallHandler,
      inputToken: token,
      outputToken: destToken,
      inputAmount: amountBigInt,
      outputAmount,
      destinationChainId: BigInt(targetChainId),
      exclusiveRelayer,
      quoteTimestamp, // quoteTimestamp
      fillDeadline, // fillDeadline,
      exclusivityDeadline,
      message: refuelMessage,
    }),

    // mintFor
    mintCall,
  ];

  const message = buildMulticallMessage(calls, initiator);

  const data = encodeFunctionData({
    abi: [
      {
        name: "handleMessage",
        type: "function",
        inputs: [
          { name: "token", type: "address" },
          { name: "message", type: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "handleMessage",
    args: [token, message],
  });

  return {
    target: sourceMulticallHandler,
    data,
  };
}
