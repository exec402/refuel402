"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import ChainSelector from "./chain-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wallet, Zap, X, Settings } from "lucide-react";

import { useConnectWalletModalStore } from "@/stores/connectWalletModal";
import { useMutation } from "@tanstack/react-query";
import { formatEther, formatUnits, isAddress, parseUnits } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskFeeStore } from "@/stores/taskFee";

import { formatNumber } from "@/lib/utils";
import { REFERRER_ADDRESS } from "@/lib/constants";

import RecipientsUploader from "./recipients-uploader";

import { useCall } from "@exec402/react";

import { toast } from "sonner";
import { useAccount } from "wagmi";
import { type Chain, baseSepolia } from "viem/chains";

import { useLastRefuelTaskIdStore } from "@/stores/lastRefuelId";

import { useTokenBalance } from "@/hooks/useTokenBalances";
import { getRefuelData } from "@/lib/utils";

import { useAutoCallTaskFee } from "@/hooks/useAutoCallTaskFee";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { useUsdc } from "@/hooks/useToken";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRefuelQuote } from "@/hooks/useRefuelQuote";
import { useCurrentChainTokenPrice } from "@/hooks/useCurrentChainTokenPrice";

type Tab = "solo" | "batch";

const tabs = [
  { label: "Solo", value: "solo" as const },
  { label: "Batch", value: "batch" as const },
];

const SOLO_AMOUNTS = [1, 5, 10, 20] as const;
const BATCH_AMOUNTS = [50, 100, 200, 500] as const;

export default function RefuelForm() {
  const [tab, setTab] = useState<Tab>("solo");

  const { setOpen: setConnectWalletModalOpen } = useConnectWalletModalStore();
  const [soloAmount, setSoloAmount] = useState<number>(SOLO_AMOUNTS[0]);
  const [batchAmount, setBatchAmount] = useState<number>(BATCH_AMOUNTS[2]);

  const [targetChain, setTargetChain] = useState<Chain>(baseSepolia);
  const [recipients, setRecipients] = useState<string[]>([]);

  const amounts = tab === "solo" ? SOLO_AMOUNTS : BATCH_AMOUNTS;
  const amount = tab === "solo" ? soloAmount : batchAmount;

  const [isRefuelingForOther, setIsRefuelingForOther] = useState(false);
  const [destination, setDestination] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { taskFee, setTaskFee, isAutoTaskFee, toggleIsAutoTaskFee } =
    useTaskFeeStore();
  const { setLastRefuelTaskId } = useLastRefuelTaskIdStore();

  const { address } = useAccount();

  const currentChain = useCurrentChain();
  const usdc = useUsdc();

  useEffect(() => {
    if (isRefuelingForOther && isAddress(destination) && tab === "solo") {
      setRecipients([destination]);
    } else if (!isRefuelingForOther && address && tab === "solo") {
      setRecipients([address]);
    } else {
      setRecipients([]);
    }
  }, [isRefuelingForOther, destination, address, tab]);

  const invalidDestination = useMemo(
    () => destination && !isAddress(destination),
    [destination]
  );

  const handlePickAmount = (a: number) => {
    if (tab === "solo") setSoloAmount(a);
    else setBatchAmount(a);
  };

  const { mutateAsync: call } = useCall();

  const refuelData = useMemo(
    () =>
      address && currentChain
        ? getRefuelData(
            address,
            amount.toString(),
            recipients as `0x${string}`[],
            currentChain.id,
            targetChain.id
          )
        : undefined,
    [amount, recipients, targetChain, address, currentChain]
  );

  const { mutate: refuel, isPending: isRefueling } = useMutation({
    mutationFn: async () => {
      if (!currentChain) {
        throw new Error("Unsupported network");
      }
      if (!refuelData) {
        throw new Error("Invalid refuel data");
      }

      const description = `Refuel ${amount} ${usdc?.symbol} to ${
        recipients.length
      } ${recipients.length > 1 ? "addresses" : "address"}(from ${
        currentChain.name
      } to ${targetChain.name})`;

      const fee = isAutoTaskFee
        ? (autoTaskFee || 0).toString()
        : taskFee || "0";

      return await call({
        amount: parseUnits(amount.toString(), usdc?.decimals ?? 6).toString(),
        target: refuelData.target,
        description,
        data: refuelData.data as `0x${string}`,
        chainId: currentChain?.id,
        referrer: REFERRER_ADDRESS as `0x${string}`,
        fee: parseUnits(fee, usdc?.decimals ?? 6).toString(),
      }).catch((err) => {
        console.log(err);
        if (
          err.name === "UserRejectedRequestError" ||
          err.message.includes("User rejected")
        ) {
          return;
        }
        throw new Error(err.response?.data.error ?? "Unknown error");
      });
    },
    onSuccess: (data) => {
      console.log(data);
      if (data) {
        setLastRefuelTaskId(data.taskId);
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error(`Refuel failed: ${error.message ?? "Unknown error"}`);
    },
  });

  const { data: refuelQuote } = useRefuelQuote({
    amountUsdc: BigInt(amount * 10 ** (usdc?.decimals ?? 6)),
    targetChainId: targetChain.id,
  });

  const ethPrice = useCurrentChainTokenPrice();

  const usdcBalance = useTokenBalance(usdc);

  const autoTaskFee = useAutoCallTaskFee({
    target: refuelData?.target ?? "0x",
    data: refuelData?.data ?? "0x",
  });

  const insufficientBalance = useMemo(() => {
    return usdcBalance === undefined
      ? false
      : Number(formatUnits(BigInt(usdcBalance.balance), usdc?.decimals ?? 6)) <
          amount + (isAutoTaskFee ? autoTaskFee ?? 0 : Number(taskFee ?? 0));
  }, [usdcBalance, amount, autoTaskFee, taskFee, isAutoTaskFee, usdc]);

  const isCrossChain = useMemo(() => {
    return targetChain.id !== currentChain?.id;
  }, [targetChain, currentChain]);

  return (
    <motion.div
      className="rounded-lg border dark:bg-accent/60 bg-white"
      key="refuel-form"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <div className="flex justify-between px-6 pr-3 border-b items-center">
        <ul role="tablist" className="relative flex gap-6 flex-1">
          {tabs.map(({ label, value }) => {
            const active = value === tab;
            return (
              <li
                key={value}
                role="tab"
                aria-selected={active}
                tabIndex={0}
                onClick={() => setTab(value)}
                className={cn(
                  "relative cursor-pointer py-4 whitespace-nowrap font-semibold",
                  "text-muted-foreground",
                  active && "text-foreground"
                )}
              >
                {label}
                {active && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute -bottom-0.5 h-1 w-full rounded-sm bg-primary"
                    transition={{
                      type: "spring",
                      duration: 0.8,
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          {!settingsOpen && (
            <span
              className={cn(
                "text-sm text-muted-foreground",
                Number(taskFee) < (autoTaskFee ?? 0) &&
                  !isAutoTaskFee &&
                  "text-red-500"
              )}
            >
              Fee: {formatNumber(isAutoTaskFee ? autoTaskFee : taskFee)}{" "}
              {usdc?.symbol}
            </span>
          )}
          <Popover onOpenChange={setSettingsOpen} open={settingsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="shadow-none" align="end">
              <div className="flex justify-between gap-6">
                <span className="mt-2">Fee</span>
                <div>
                  <div className="flex items-center flex-1 border px-1 py-0.5 pr-2 rounded-full">
                    <Button
                      variant="secondary"
                      size="sm"
                      className={cn(
                        "text-muted-foreground bg-accent hover:bg-accent/80 rounded-full",
                        isAutoTaskFee &&
                          "bg-blue-50 hover:bg-blue-50 text-blue-500"
                      )}
                      onClick={() => toggleIsAutoTaskFee()}
                    >
                      Auto
                    </Button>
                    <Input
                      className="ring-0 focus-visible:ring-0 border-none text-right"
                      type="number"
                      step={0.01}
                      defaultValue={taskFee}
                      onFocus={() => {
                        if (isAutoTaskFee) {
                          toggleIsAutoTaskFee();
                        }
                      }}
                      onChange={(e) => {
                        setTaskFee(e.target.value);
                      }}
                    />
                    <span className="text-sm">{usdc?.symbol}</span>
                  </div>
                  {Number(taskFee) < (autoTaskFee ?? 0) && !isAutoTaskFee && (
                    <p className="text-sm text-red-500">
                      Tasks with low fees may not get executed.
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-3">
          <h3 className="font-medium">Target Chain</h3>
          <ChainSelector onChange={setTargetChain} />
        </div>

        {tab === "batch" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">Recipients</h3>
            <RecipientsUploader onAddressesExtracted={setRecipients} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="font-medium">Refuel Amount</h3>
          <div className="grid gap-4 grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 p-4 rounded-lg bg-accent/80">
            {amounts.map((a) => (
              <Button
                key={a}
                variant="outline"
                className={cn(
                  "h-11 relative font-semibold border-border/80 hover:bg-background active:scale-95 bg-white dark:bg-background/80 cursor-pointer transition-all",
                  amount === a &&
                    "border-primary dark:border-primary shadow-md scale-105"
                )}
                onClick={() => handlePickAmount(a)}
              >
                {a} {usdc?.symbol}
              </Button>
            ))}
          </div>
        </div>

        {tab === "solo" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="refueling-for-other"
                checked={isRefuelingForOther}
                onCheckedChange={(e) => setIsRefuelingForOther(Boolean(e))}
              />
              <Label htmlFor="refueling-for-other">
                I&apos;m refueling an address other than my own.
              </Label>
            </div>

            {isRefuelingForOther && (
              <div className="border-2 rounded-lg focus-within:border-primary px-3 relative">
                <Input
                  type="text"
                  placeholder="Destination address"
                  value={destination}
                  autoFocus
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-11 font-semibold focus-visible:ring-0 p-0 shadow-none border-0 dark:bg-transparent pr-6"
                />
                {invalidDestination && (
                  <p className="absolute bottom-3 right-2 text-sm text-white bg-red-400 rounded-full p-1">
                    <X className="size-3" />
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          {address ? (
            <Button
              className="h-12 text-lg w-full"
              onClick={() => refuel()}
              disabled={
                isRefueling || insufficientBalance || !recipients.length
              }
            >
              {isRefueling ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Zap className="size-5" />
              )}
              {insufficientBalance ? (
                <span>Insufficient Balance</span>
              ) : (
                <span>{isCrossChain && "Cross Chain "}Refuel</span>
              )}
            </Button>
          ) : (
            <Button
              className="h-12 text-lg w-full"
              onClick={() => setConnectWalletModalOpen(true)}
            >
              <Wallet className="size-5" />
              Connect Wallet
            </Button>
          )}
        </div>
        {recipients.length > 0 && (
          <div className="text-sm text-muted-foreground select-none">
            <div className="flex items-start justify-between select-none mb-1">
              {refuelQuote ? (
                <div className="max-w-[calc(100vw-10rem)]">
                  You&apos;ll get:{" "}
                  <span className="text-foreground">
                    {formatNumber(formatEther(refuelQuote))} ETH
                  </span>
                  {ethPrice && (
                    <span className="ml-1 text-muted-foreground/60">
                      ($
                      {formatNumber(
                        (Number(formatEther(refuelQuote)) * ethPrice).toFixed(3)
                      )}
                      )
                    </span>
                  )}
                  {/* <span className="ml-1 text-[#2c5cf5]">
                    +{" "}
                    {formatNumber(
                      (isAutoTaskFee
                        ? autoTaskFee ?? 0
                        : Number(taskFee ?? 0)) * EXEC_REWARD_PER_USDC
                    )}{" "}
                    EXEC
                  </span> */}
                </div>
              ) : (
                <Skeleton className="h-5 w-42" />
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
