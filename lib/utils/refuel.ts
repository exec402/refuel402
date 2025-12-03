import { buildCall, buildMulticallMessage } from "@/lib/execCore";
import { encodeFunctionData, parseUnits, type Address } from "viem";
import { ethUsdcPoolFees, MINTER_ADDRESS } from "@/lib/constants";
import { getChainConfig } from "@exec402/core";
import { minterAbi } from "@/lib/abis/minterAbi";

export function buildRefuelMessage(
  initiator: Address,
  amountUsdc: string,
  recipients: Address[],
  sourceChainId: number,
  targetChainId: number,
  minEthOut = "0"
) {
  const targetChainConfig = getChainConfig(targetChainId);
  if (!targetChainConfig) {
    throw new Error(`Unsupported target chain: ${targetChainId}`);
  }

  const { usdc, weth } = targetChainConfig.tokens;
  const { swapRouter, multicallHandler, execCore } =
    targetChainConfig.contracts;

  const amountUsdcBigInt = parseUnits(amountUsdc, 6);
  const minEthOutBigInt = parseUnits(minEthOut, 18);

  const poolFee = ethUsdcPoolFees[targetChainId];

  const calls = [];

  const isCrossChain = targetChainId !== sourceChainId;

  if (!isCrossChain) {
    calls.push(
      buildCall(
        usdc,
        encodeFunctionData({
          abi: [
            {
              name: "transferFrom",
              type: "function",
              inputs: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "nonpayable",
            },
          ],
          functionName: "transferFrom",
          args: [execCore, multicallHandler, amountUsdcBigInt],
        })
      )
    );
  }

  // Call 0: Approve USDC to SwapRouter
  calls.push(
    buildCall(
      usdc,
      encodeFunctionData({
        abi: [
          {
            name: "approve",
            type: "function",
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "approve",
        args: [swapRouter, BigInt(2) ** BigInt(256) - BigInt(1)], // type(uint256).max
      })
    )
  );

  // Call 1: Swap USDC → WETH
  calls.push(
    buildCall(
      swapRouter,
      encodeFunctionData({
        abi: [
          {
            name: "exactInputSingle",
            type: "function",
            inputs: [
              {
                name: "params",
                type: "tuple",
                components: [
                  { name: "tokenIn", type: "address" },
                  { name: "tokenOut", type: "address" },
                  { name: "fee", type: "uint24" },
                  { name: "recipient", type: "address" },
                  { name: "amountIn", type: "uint256" },
                  { name: "amountOutMinimum", type: "uint256" },
                  { name: "sqrtPriceLimitX96", type: "uint160" },
                ],
              },
            ],
            outputs: [{ name: "amountOut", type: "uint256" }],
            stateMutability: "payable",
          },
        ],
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: usdc,
            tokenOut: weth,
            fee: poolFee,
            recipient: multicallHandler,
            amountIn: amountUsdcBigInt,
            amountOutMinimum: minEthOutBigInt,
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
      })
    )
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
    buildCall(
      multicallHandler,
      encodeFunctionData({
        abi: [
          {
            name: "makeCallWithBalance",
            type: "function",
            inputs: [
              { name: "target", type: "address" },
              { name: "callData", type: "bytes" },
              { name: "value", type: "uint256" },
              {
                name: "replacement",
                type: "tuple[]",
                components: [
                  { name: "token", type: "address" },
                  { name: "offset", type: "uint256" },
                ],
              },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "makeCallWithBalance",
        args: [weth, withdrawCalldata, BigInt(0), replacements],
      })
    )
  );

  // Call 3: Distribute ETH evenly to all recipients
  // Uses distributeTokenEvenly because we don't know the exact ETH amount in advance
  calls.push(
    buildCall(
      multicallHandler,
      encodeFunctionData({
        abi: [
          {
            name: "distributeTokenEvenly",
            type: "function",
            inputs: [
              { name: "token", type: "address" },
              { name: "recipients", type: "address[]" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "distributeTokenEvenly",
        args: [
          "0x0000000000000000000000000000000000000000", // address(0) for ETH
          recipients,
        ],
      })
    )
  );

  // Call 4: Mint EXEC reward for the initiator
  calls.push(
    buildCall(
      MINTER_ADDRESS,
      encodeFunctionData({
        abi: minterAbi,
        functionName: "mintFor",
        args: [initiator],
      })
    )
  );

  const message = buildMulticallMessage(calls, initiator);

  return message;
}

export function getRefuelData(
  initiator: Address,
  amountUsdc: string,
  recipients: Address[],
  sourceChainId: number,
  targetChainId: number,
  minEthOut = "0"
) {
  const sourceChainConfig = getChainConfig(sourceChainId);
  if (!sourceChainConfig) {
    return undefined;
  }
  const sourceUsdc = sourceChainConfig.tokens.usdc;
  const sourceMulticallHandler = sourceChainConfig.contracts.multicallHandler;
  const sourceExecCore = sourceChainConfig.contracts.execCore;
  const sourceSpokePool = sourceChainConfig.contracts.spokePool;

  const targetChainConfig = getChainConfig(targetChainId);
  if (!targetChainConfig) {
    return undefined;
  }

  const destMulticallHandler = targetChainConfig.contracts.multicallHandler;
  const destUsdc = targetChainConfig.tokens.usdc;

  const message = buildRefuelMessage(
    initiator,
    amountUsdc,
    recipients,
    sourceChainId,
    targetChainId,
    minEthOut
  );

  const isCrossChain = targetChainId !== sourceChainId;

  let data = "";

  if (isCrossChain) {
    data = encodeFunctionData({
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
        sourceUsdc, // inputToken
        destUsdc, // outputToken
        parseUnits(amountUsdc, 6), // inputAmount
        parseUnits(amountUsdc, 6), // outputAmount
        BigInt(targetChainId), // destinationChainId
        "0x0000000000000000000000000000000000000000",
        Math.floor(Date.now() / 1000), // quoteTimestamp
        Math.floor(Date.now() / 1000) + 4 * 3600, // fillDeadline
        0, // exclusivityDeadline
        message, // message
      ],
    });
  } else {
    data = encodeFunctionData({
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
      args: [sourceUsdc, message],
    });
  }

  return {
    target: isCrossChain ? sourceSpokePool : sourceMulticallHandler,
    data,
  };
}
