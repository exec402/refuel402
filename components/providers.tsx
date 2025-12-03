import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { CDPHooksProvider } from "@/context/cdp";
import { WagmiProvider } from "@/context/wagmi";

import { ExecProvider } from "@exec402/react";
import { QueryClientProvider } from "@/components/query-client";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CDPHooksProvider>
      <WagmiProvider>
        <QueryClientProvider>
          <ExecProvider network="testnet">
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ExecProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </CDPHooksProvider>
  );
}
