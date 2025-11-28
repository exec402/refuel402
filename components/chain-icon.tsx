import Image from "next/image";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { cn } from "@/lib/utils";

export default function ChainIcon({ className }: { className?: string }) {
  const currentChain = useCurrentChain();
  return currentChain ? (
    <Image
      src={`/icons/chains/${currentChain.id}.png`}
      alt="Chain Icon"
      width={32}
      height={32}
      className={cn("rounded-full szie-5", className)}
    />
  ) : null;
}
