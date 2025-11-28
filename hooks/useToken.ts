import { useMemo } from "react";
import { useCurrentChain } from "./useCurrentChain";
import { getUsdc, getWeth } from "@/lib/constants/tokens";

export function useUsdc() {
  const currentChain = useCurrentChain();

  return useMemo(() => {
    return currentChain ? getUsdc(currentChain.id) : undefined;
  }, [currentChain]);
}

export function useWeth() {
  const currentChain = useCurrentChain();

  return useMemo(() => {
    return currentChain ? getWeth(currentChain.id) : undefined;
  }, [currentChain]);
}
