import { ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type Chain } from "viem/chains";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

function ChainOption({
  chain,
  onClick,
  isTrigger,
  selected,
  active,
}: {
  chain: Chain;
  selected?: boolean;
  isTrigger?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex select-none px-4 items-center py-3 cursor-pointer transition-all justify-between hover:bg-accent even:border-t",
        "even:border-t-accent first:rounded-t-lg last:rounded-b-lg",
        isTrigger && "border",
        active && "bg-accent"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-muted">
          <Image
            src={`/icons/chains/${chain.id}.png`}
            alt={chain.name}
            width={64}
            height={64}
            className="size-6 rounded-lg"
          />
        </div>
        <div className="font-semibold">{chain.name}</div>
      </div>
      {isTrigger ? (
        <ChevronDown className="size-5" />
      ) : (
        selected && <Check className="size-4 text-muted-foreground/80" />
      )}
    </div>
  );
}

export default function ChainSelector({
  onChange,
}: {
  onChange: (chain: Chain) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const currentChain = useCurrentChain();
  const [chain, setChain] = useState<Chain>(
    currentChain ?? SUPPORTED_CHAINS[0]
  );

  useEffect(() => {
    onChange(chain);
  }, [chain, onChange]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div onClick={() => setPopoverOpen(true)}>
          <ChainOption chain={chain} active={popoverOpen} isTrigger />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="rounded-lg overflow-hidden shadow-none p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        {SUPPORTED_CHAINS.map((c) => (
          <ChainOption
            key={c.id}
            chain={c}
            selected={chain.id === c.id}
            onClick={() => {
              setChain(c);
              setPopoverOpen(false);
            }}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}
