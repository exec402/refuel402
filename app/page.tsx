"use client";

import RefuelForm from "./refuel-form";
import StatusModal from "./status-modal";
import Image from "next/image";

export default function Refuel() {
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 sm:mt-6 md:mt-8 px-6">
        One click, full tank — ready for the next block.
      </h1>
      <div className="mt-8">
        <RefuelForm />
      </div>
      <StatusModal />
      <div className="flex items-center justify-center pt-4 pb-6 text-sm">
        <span className="text-muted-foreground/60">Powered by</span>
        <a
          href="https://exec402.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:underline hover:text-primary ml-2 font-medium"
        >
          <Image
            src="/exec-logo.png"
            alt="Exec402"
            width={32}
            height={32}
            className="size-4 block dark:hidden"
          />
          <Image
            src="/exec-logo-white.png"
            alt="Exec402"
            width={32}
            height={32}
            className="size-4 hidden dark:block"
          />
          exec402
        </a>
      </div>
    </div>
  );
}
