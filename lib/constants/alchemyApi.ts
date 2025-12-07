import { baseSepolia, optimismSepolia, base, optimism, bsc } from "wagmi/chains";

const alchemyKey = process.env.ALCHEMY_KEY;

export const alchemyApis: Record<number, string> = {
  [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`,
  [optimismSepolia.id]: `https://opt-sepolia.g.alchemy.com/v2/${alchemyKey}`,
  [base.id]: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  [optimism.id]: `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  [bsc.id]: `https://bnb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
};
