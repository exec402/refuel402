import { useChainId, useChains } from "wagmi";
import { useMemo } from "react";

export function useCurrentChain() {
  const chains = useChains();
  const chainId = useChainId();

  return useMemo(() => {
    return chains.find((chain) => chain.id === chainId);
  }, [chains, chainId]);
}
