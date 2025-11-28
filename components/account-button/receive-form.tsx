import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { useClipboard } from "@/hooks/useClipboard";
import { Check, Copy } from "lucide-react";
import { ellipseMiddle } from "@/lib/utils";
import QRCode from "react-qr-code";

export default function ReceiveForm() {
  const { address } = useAccount();
  const { onCopy: onCopyAddress, hasCopied } = useClipboard(address ?? "");
  return (
    <div className="flex items-center justify-center p-6">
      <div className="mx-auto flex items-center flex-col gap-6">
        <div className="py-6 text-2xl font-semibold text-center">
          Scan or copy address to deposit tokens
        </div>
        <div className="p-4 bg-white rounded-md border">
          <QRCode value={address ?? ""} size={160} />
        </div>
        <div className="font-semibold text-xl">
          {ellipseMiddle(address ?? "", 10, 8)}
        </div>
        <Button onClick={onCopyAddress} size="lg">
          {hasCopied ? <Check /> : <Copy />}
          Copy wallet address
        </Button>
        <span className="text-center text-sm text-muted-foreground">
          You can receive any token from any EVM-based network with this
          address.
        </span>
      </div>
    </div>
  );
}
