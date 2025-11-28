"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";
import { useSwitchChain } from "wagmi";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function NetworkGuard() {
  const { chain, address } = useAccount();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (address && !chain) {
      // eslint-disable-next-line
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [chain, address, setOpen]);

  const { switchChain } = useSwitchChain();

  const onSwitchNetwork = () => {
    switchChain({ chainId: DEFAULT_CHAIN_ID });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsupported Network</AlertDialogTitle>
          <AlertDialogDescription>
            You’re currently connected to an unsupported network. Switch your
            wallet to a supported chain to proceed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSwitchNetwork}>
            Switch Network
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
