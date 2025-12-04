import { useCallback, useState, type FormEvent } from "react";
import Decimal from "decimal.js";
import { ChevronDown, Clipboard, Loader2, Send } from "lucide-react";
import {
  parseUnits,
  type Address,
  isAddress,
  erc20Abi,
  formatUnits,
} from "viem";
import { usePublicClient, useSendTransaction, useWriteContract } from "wagmi";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import TokenIcon from "@/components/token-icon";
import { formatNumber } from "@/lib/utils";

import { Input } from "../ui/input";
import { useTokenBalance, useTokenBalances } from "@/hooks/useTokenBalances";
import { useUsdc } from "@/hooks/useToken";
import {
  NativeToken,
  Token,
  NativeTokenBalance,
  TokenBalance,
} from "@/types/token";
import { ETH } from "@/lib/constants/tokens";
import { useAccount, useBalance } from "wagmi";

function TokenSelect({
  selectedToken,
  onSelectToken,
}: {
  selectedToken: Token | NativeToken | undefined;
  onSelectToken: (token: Token | NativeToken) => void;
}) {
  const { address } = useAccount();
  const { data: tokenBalances } = useTokenBalances();
  const { data: nativeBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // Combine ETH with ERC20 tokens
  const allBalances: (TokenBalance | NativeTokenBalance)[] = [];

  if (nativeBalance) {
    allBalances.push({
      token: ETH,
      balance: nativeBalance.value.toString(),
    });
  }

  if (tokenBalances) {
    allBalances.push(...tokenBalances);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full rounded-lg items-center justify-between gap-3 border border-transparent bg-muted/60 px-3 py-2 text-left transition-colors hover:bg-background"
        >
          <div className="flex items-center gap-3">
            {selectedToken ? (
              <>
                <TokenIcon token={selectedToken} className="size-7" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {selectedToken.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Balance{" "}
                    {formatNumber(
                      formatUnits(
                        BigInt(
                          allBalances.find(
                            (balance) => balance.token === selectedToken
                          )?.balance ?? "0"
                        ),
                        selectedToken.decimals
                      )
                    )}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Select Token
              </span>
            )}
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg shadow-none"
        align="start"
        style={{
          width: "var(--radix-popper-anchor-width)",
        }}
      >
        {allBalances.length ? (
          allBalances.map(({ token, balance }) => (
            <DropdownMenuItem
              key={token.symbol}
              onSelect={() => {
                onSelectToken(token);
              }}
              className="flex items-center gap-3 rounded-lg"
            >
              <TokenIcon token={token} className="size-6" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {token.symbol}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(formatUnits(BigInt(balance), token.decimals))}{" "}
                  {token.symbol}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No tokens found
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SendForm({
  defaultToken,
}: {
  defaultToken?: Token | NativeToken;
}) {
  const usdc = useUsdc();
  const [selectedToken, setSelectedToken] = useState<
    Token | NativeToken | undefined
  >(defaultToken ?? usdc);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);

  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const tokenBalance = useTokenBalance(selectedToken);

  const balance =
    tokenBalance !== undefined
      ? formatUnits(BigInt(tokenBalance.balance), tokenBalance.token.decimals)
      : undefined;

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.replace(/,/g, ".");
      if (/^\d*(\.\d*)?$/.test(value) || value === "") {
        setAmount(value);
      }
    },
    []
  );

  const handleUseMax = useCallback(() => {
    if (!balance) return;
    setAmount(String(balance));
  }, [balance]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRecipient(text.trim());
      }
    } catch (error) {
      console.error("Failed to read from clipboard", error);
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedToken) return;

    const normalizedRecipient = recipient.trim();
    if (!isAddress(normalizedRecipient)) {
      toast.error("Invalid recipient address");
      return;
    }

    const decimals = selectedToken.decimals;

    const sanitizedDecimal = new Decimal(amount)
      .toDecimalPlaces(decimals, Decimal.ROUND_DOWN)
      .toString();

    if (!sanitizedDecimal || sanitizedDecimal === "0") {
      toast.error("Invalid amount");
      return;
    }

    let amountWei: bigint;

    try {
      amountWei = parseUnits(sanitizedDecimal, decimals);
    } catch {
      toast.error("Invalid amount");
      return;
    }

    if (amountWei <= BigInt(0)) {
      toast.error("Transfer amount must be greater than 0");
      return;
    }

    const toastId = toast.loading("Sending...");

    try {
      setSending(true);

      let hash: `0x${string}`;

      if ("address" in selectedToken) {
        hash = await writeContractAsync({
          address: selectedToken.address,
          abi: erc20Abi,
          functionName: "transfer",
          args: [normalizedRecipient as Address, amountWei],
        });
      } else {
        hash = await sendTransactionAsync({
          to: normalizedRecipient as Address,
          value: amountWei,
        });
      }

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      toast.success("Sent!", { id: toastId });
      setAmount("");
      // await refetchBalances();
    } catch (error) {
      toast.dismiss(toastId);
      console.log(error);
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-2">
        <p className="font-semibold">Token</p>
        <div>
          <TokenSelect
            selectedToken={selectedToken}
            onSelectToken={(token) => {
              setSelectedToken(token);
              setAmount("");
            }}
          />

          <div className="mt-4 flex items-center rounded-lg justify-between border-2 border-transparent gap-3 bg-muted/60 px-3 py-2 focus-within:border-primary focus-within:bg-background">
            <Input
              value={amount}
              onChange={handleAmountChange}
              inputMode="decimal"
              placeholder="0"
              autoFocus
              className="w-full dark:bg-transparent p-0 border-none shadow-none focus-visible:outline-none focus-visible:ring-0 bg-transparent text-xl! font-semibold tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleUseMax}
              disabled={!tokenBalance}
            >
              Max
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Recipient Wallet</p>
        <div className="flex rounded-lg items-center gap-3 border-2 border-transparent bg-muted/60 px-3 py-2 focus-within:border-primary focus-within:bg-background">
          <Input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="Wallet Address or ENS"
            className="flex-1 dark:bg-transparent p-0 border-none shadow-none focus-visible:outline-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handlePaste}
            title="Past Wallet Address"
          >
            <Clipboard className="size-4" />
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 gap-2 text-base font-semibold"
      >
        {sending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Send
      </Button>
    </form>
  );
}
