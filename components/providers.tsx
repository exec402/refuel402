import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { CDPHooksProvider } from "@/context/cdp";
import { WagmiProvider } from "@/context/wagmi";

import { QueryClientProvider } from "@/components/query-client";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CDPHooksProvider>
      <WagmiProvider>
        <QueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </CDPHooksProvider>
  );
}
