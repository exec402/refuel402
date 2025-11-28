import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { ellipseMiddle } from "@/lib/utils";
import { useAccount } from "wagmi";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useState } from "react";
import AccountSheet from "./account-sheet";
import ChainIcon from "../chain-icon";

export default function AccountButton() {
  const { address } = useAccount();
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        className="px-2"
        size="lg"
        onClick={() => setAccountSheetOpen(true)}
      >
        <div className="relative">
          <Jazzicon diameter={20} seed={jsNumberForAddress(address ?? "")} />
          <ChainIcon className="absolute -bottom-0.5 -right-0.5 border-2 border-background size-3.5" />
        </div>
        <span className="hidden lg:inline">{ellipseMiddle(address ?? "")}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </Button>
      <AccountSheet
        open={accountSheetOpen}
        setOpen={() => setAccountSheetOpen(false)}
      />
    </>
  );
}
