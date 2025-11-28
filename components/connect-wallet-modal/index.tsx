"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useConnect } from "wagmi";
import ConnectForm from "./connect-form";
import { useConnectWalletModalStore } from "@/stores/connectWalletModal";

export default function ConnectWalletModal() {
  const { open, setOpen } = useConnectWalletModalStore();
  const { connectors } = useConnect();

  const filteredConnectors = connectors.filter(
    (connector) =>
      connector.type === "injected" &&
      !["injected", "cdp-embedded-wallet"].includes(connector.id)
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[420px]!">
        <DialogHeader>
          <DialogTitle className="text-md">
            {filteredConnectors.length > 0
              ? "Connect or Create Wallet"
              : "Create Wallet"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <ConnectForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
