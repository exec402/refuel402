import { baseSepolia, optimismSepolia } from "wagmi/chains";
import { type Address } from "viem";

export const ADDRESS_MAP: Record<number, Record<string, Address>> = {
  [baseSepolia.id]: {
    usdc: "0x036cbd53842c5426634e7929541ec2318f3dcf7e" as Address,
    weth: "0x4200000000000000000000000000000000000006" as Address,
    swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4" as Address,
    quoter: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27" as Address,
    multicallHandler: "0xCe2982F214236B7286313DCc8Bbb36A5eFa9eeF2" as Address,
  },
  [optimismSepolia.id]: {
    usdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7" as Address,
    weth: "0x4200000000000000000000000000000000000006" as Address,
    swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4" as Address,
    quoter: "0x0FBEa6cf957d95ee9313490050F6A0DA68039404" as Address,
    multicallHandler: "0x18574652852147d6445d3db18D0810D3E5f5241c" as Address,
  },
};
