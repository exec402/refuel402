"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";
import { useConnectWalletModalStore } from "@/stores/connectWalletModal";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import AccountButton from "@/components/account-button";

import { useIsInitialized } from "@coinbase/cdp-hooks";

import ThemeToggle from "@/components/theme-toggle";

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
