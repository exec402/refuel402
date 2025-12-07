import "server only";

import { baseSepolia, optimismSepolia, base } from "wagmi/chains";

const alchemyKey = process.env.ALCHEMY_KEY;

export const alchemyApis: Record<number, string> = {
  [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`,
  [optimismSepolia.id]: `https://opt-sepolia.g.alchemy.com/v2/${alchemyKey}`,
  [base.id]: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
};
