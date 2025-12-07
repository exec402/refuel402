import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { ellipseMiddle } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  ArrowLeft,
  Check,
} from "lucide-react";

import { useAccount, useSwitchChain } from "wagmi";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";

import { useCurrentChain } from "@/hooks/useCurrentChain";
import ChainIcon from "../chain-icon";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import Image from "next/image";

export default function AccountMenu() {
  const { address } = useAccount();
  const { onCopy } = useClipboard(address ?? "");
  const { switchChain } = useSwitchChain();
  const [showChainMenu, setShowChainMenu] = useState(false);

  const currentChain = useCurrentChain();

  const onCopyAddress = () => {
    onCopy();
    toast("Address copied!");
  };

  const onSwitchChain = (chainId: number) => {
    switchChain({ chainId });
    setShowChainMenu(false);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setShowChainMenu(false);
    }
  };

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="group flex cursor-pointer flex-1 items-center justify-center sm:flex-none sm:justify-start">
        <div className="relative">
          <Jazzicon diameter={32} seed={jsNumberForAddress(address ?? "")} />
          <ChainIcon className="absolute -bottom-0.5 -right-0.5 border-2 border-background size-4.5" />
        </div>
        <div className="flex items-center space-x-1 ml-3">
          <span className="font-semibold text-lg">
            {ellipseMiddle(address ?? "", 4, 6)}
          </span>
        </div>
        <ChevronDown className="size-5 ml-2 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="shadow-none max-w-[320px] min-w-[280px]"
        align="start"
      >
        {showChainMenu ? (
          <>
            <DropdownMenuItem
              className="py-3 px-4 font-medium"
              onSelect={(e) => {
                e.preventDefault();
                setShowChainMenu(false);
              }}
            >
              <ArrowLeft /> Back
            </DropdownMenuItem>
            {SUPPORTED_CHAINS.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                className="py-3 px-4 font-medium"
                onClick={() => onSwitchChain(chain.id)}
              >
                <Image
                  src={`/icons/chains/${chain.id}.png`}
                  alt={chain.name}
                  width={20}
                  height={20}
                  className="size-5 rounded-full"
                />
                {chain.name}
                {currentChain?.id === chain.id && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="py-3 px-4 font-medium"
              onClick={onCopyAddress}
            >
              <Copy /> Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              className="py-3 px-4 font-medium"
              onSelect={(e) => {
                e.preventDefault();
                setShowChainMenu(true);
              }}
            >
              <ChainIcon className="size-4" />
              Switch Chain
              <ChevronRight className="ml-auto size-4" />
            </DropdownMenuItem>
            <a
              href={`${currentChain?.blockExplorers?.default.url}/address/${address}`}
              target="_blank"
            >
              <DropdownMenuItem className="py-3 px-4 font-medium">
                <ExternalLink /> View on Explorer
              </DropdownMenuItem>
            </a>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
