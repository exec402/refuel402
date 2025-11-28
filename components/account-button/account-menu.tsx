import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { ellipseMiddle } from "@/lib/utils";
import { ChevronDown, Copy, ExternalLink } from "lucide-react";

import { useAccount } from "wagmi";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";

import { useCurrentChain } from "@/hooks/useCurrentChain";

export default function AccountMenu() {
  const { address } = useAccount();
  const { onCopy } = useClipboard(address ?? "");

  const currentChain = useCurrentChain();

  const onCopyAddress = () => {
    onCopy();
    toast("Address copied!");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex cursor-pointer flex-1 items-center justify-center sm:flex-none sm:justify-start">
        <Jazzicon diameter={38} seed={jsNumberForAddress(address ?? "")} />
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
        <DropdownMenuItem
          className="py-3 px-4 font-medium"
          onClick={onCopyAddress}
        >
          <Copy /> Copy Address
        </DropdownMenuItem>
        <a
          href={`${currentChain?.blockExplorers?.default.url}/address/${address}`}
          target="_blank"
        >
          <DropdownMenuItem className="py-3 px-4 font-medium">
            <ExternalLink /> View on Explorer
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
