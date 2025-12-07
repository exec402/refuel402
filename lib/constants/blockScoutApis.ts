import "server only";

import { baseSepolia, optimismSepolia, base } from "wagmi/chains";

export const blockScoutApis: Record<number, string> = {
  [baseSepolia.id]: "https://base-sepolia.blockscout.com/api/v2",
  [optimismSepolia.id]: "https://testnet-explorer.optimism.io/api/v2",
  [base.id]: "https://base.blockscout.com/api/v2",
};
