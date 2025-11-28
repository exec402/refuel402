import {
  encodeAbiParameters,
  parseAbiParameters,
  type Address,
  type Hex,
} from "viem";

/**
 * MulticallHandler Call structure
 */
export interface Call {
  target: Address;
  callData: Hex;
  value: bigint;
}

/**
 * MulticallHandler Replacement structure
 */
export interface Replacement {
  token: Address; // address(0) for native ETH
  offset: bigint; // Byte offset in callData
}

/**
 * MulticallHandler Instructions structure
 */
export interface Instructions {
  calls: Call[];
  fallbackRecipient: Address;
}

/**
 * Build a single Call
 */
export function buildCall(
  target: Address,
  callData: Hex,
  value: bigint = BigInt(0)
): Call {
  return { target, callData, value };
}

/**
 * Build MulticallHandler message
 */
export function buildMulticallMessage(
  calls: Call[],
  fallbackRecipient: Address
): Hex {
  return encodeAbiParameters(
    parseAbiParameters("((address,bytes,uint256)[],address)"),
    [
      [
        calls.map((call) => [call.target, call.callData, call.value]),
        fallbackRecipient,
        // eslint-disable-next-line
      ] as any,
    ]
  );
}
