"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useConnectWalletModalStore } from "@/stores/connectWalletModal";
import { useAccount } from "wagmi";
import { Wallet, Share2, Copy, Check } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import AccountButton from "@/components/account-button";

import { useIsInitialized } from "@coinbase/cdp-hooks";

import ThemeToggle from "@/components/theme-toggle";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ShareButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://refuel402.com/?referrer=${address}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="size-10">
          <Share2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="outline-none">
        <DialogHeader>
          <DialogTitle>Share & Earn</DialogTitle>
          <DialogDescription>
            Share your referral link and earn{" "}
            <span className="text-foreground font-semibold">60%</span> of the
            fees from transactions made by your referrals.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={referralLink} className="flex-1 text-sm" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Topbar() {
  const { setOpen: setConnectWalletModalOpen } = useConnectWalletModalStore();

  const { isInitialized } = useIsInitialized();

  const { address } = useAccount();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`px-6 h-20 sticky top-0 z-50 bg-background/60 backdrop-blur-xs flex justify-between items-center transition-[border-color] duration-200 ${
        isScrolled ? "border-b" : ""
      }`}
    >
      <div className="flex justify-start">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={711}
            height={535}
            className="block dark:hidden sm:h-9 md:h-10 h-8 w-auto"
          />
          <Image
            src="/logo-white.png"
            alt="Logo"
            width={711}
            height={535}
            className="hidden dark:block sm:h-9 md:h-10 h-8 w-auto"
          />
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-3 md:ml-0 md:justify-self-end">
        {address && <ShareButton address={address} />}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {address ? (
          !isInitialized ? (
            <Skeleton className="h-10 w-32 rounded-lg" />
          ) : (
            <AccountButton />
          )
        ) : (
          <Button size="lg" onClick={() => setConnectWalletModalOpen(true)}>
            <Wallet />
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
