"use client";

import { cn } from "@/lib/utils";

import Image from "next/image";
import type { Token, NativeToken } from "@/types/token";

export default function TokenIcon({
  token,
  className,
}: {
  token: NativeToken | Token;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-1 flex shrink-0 rounded-full bg-accent size-8 items-center justify-center",
        className
      )}
    >
      {token.logoUri ? (
        <Image
          className="size-full rounded-full"
          src={token.logoUri}
          alt={token.symbol}
          width="32"
          height="32"
          draggable="false"
        />
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          {token.symbol.slice(0, 2)}
        </span>
      )}
    </div>
  );
}
