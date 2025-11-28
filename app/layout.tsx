import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import Topbar from "@/components/topbar";
import Providers from "@/components/providers";
import ConnectWalletModal from "@/components/connect-wallet-modal";
import NetworkGuard from "@/components/network-guard";
import { Analytics } from "@vercel/analytics/next";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refuel402",
  description: "One click, full tank — ready for the next block.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-screen relative">
          <Providers>
            <Topbar />
            <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
            <ConnectWalletModal />
            <Toaster />
            <NetworkGuard />
          </Providers>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
