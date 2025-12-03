import { QrCode, Send } from "lucide-react";

import { formatNumber } from "@/lib/utils";
import { useTokenBalance, useTokenBalances } from "@/hooks/useTokenBalances";
import TokenIcon from "@/components/token-icon";
import { TabsContent } from "@/components/ui/tabs";
import {
  NativeToken,
  NativeTokenBalance,
  Token,
  TokenBalance,
} from "@/types/token";
import { Button } from "../ui/button";
import { formatUnits } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { ETH } from "@/lib/constants/tokens";

import { useCurrentChainTokenPrice } from "@/hooks/useCurrentChainTokenPrice";

function TokenRow({
  balance,
  onClick,
}: {
  balance: TokenBalance | NativeTokenBalance;
  onClick?: (token: Token | NativeToken) => void;
}) {
  const tokenPrice = useCurrentChainTokenPrice(
    "address" in balance.token ? balance.token.address : undefined
  );
  return (
    <div
      className="flex items-center cursor-pointer justify-between hover:bg-accent px-4 py-3 transition-colors"
      onClick={() => onClick?.(balance.token)}
    >
      <div className="flex items-center">
        <TokenIcon token={balance.token} />
        <div className="flex flex-col ml-3">
          <span className="font-medium text-sm">{balance.token.symbol}</span>
          <span className="text-xs text-muted-foreground">
            {balance.balance
              ? formatNumber(
                  formatUnits(BigInt(balance.balance), balance.token.decimals)
                )
              : "-"}{" "}
            {balance.token.symbol}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {tokenPrice
            ? `$${formatNumber(
                Number(
                  formatUnits(BigInt(balance.balance), balance.token.decimals)
                ) * tokenPrice
              )}`
            : "-"}
        </span>
      </div>
    </div>
  );
}

export default function TokensContent({
  onSend,
  onReceive,
}: {
  onSend: (token?: Token | NativeToken) => void;
  onReceive: () => void;
}) {
  const { data: balances } = useTokenBalances();
  const nativeBalance = useTokenBalance(ETH);

  return (
    <TabsContent value="tokens" className="flex flex-col flex-1 h-full">
      <div className="p-4 flex flex-col space-y-1">
        <span className="text-2xl font-bold">${formatNumber(0)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 px-4">
        <Button size="lg" onClick={() => onSend()}>
          <Send />
          Send
        </Button>

        <Button size="lg" variant="secondary" onClick={onReceive}>
          <QrCode />
          Receive
        </Button>
      </div>
      <div className="flex flex-col mt-6">
        {balances === undefined || nativeBalance === undefined ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              className="px-4 py-3 flex justify-between items-center"
              key={idx}
            >
              <div className="flex">
                <Skeleton className="size-8 w-full rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))
        ) : (
          <>
            <TokenRow
              balance={nativeBalance}
              onClick={() => onSend(nativeBalance.token)}
            />
            {balances.map((balance) => (
              <TokenRow
                key={(balance.token as Token).address}
                balance={balance}
              />
            ))}
          </>
        )}
      </div>
    </TabsContent>
  );
}
