import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDisconnect } from "wagmi";

import {
  useSignOut,
  useCurrentUser,
  useIsInitialized,
} from "@coinbase/cdp-hooks";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { LogOut, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokensContent from "./tokens-content";
import HistoryContent from "./history-content";

import AccountMemu from "./account-menu";
import SendForm from "./send-form";
import ReceiveForm from "./receive-form";
import { NativeToken, Token } from "@/types/token";

const TABS = [
  { id: "tokens", label: "Tokens" },
  { id: "history", label: "History" },
];

export default function AccountSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<string>("tokens");

  const [isSend, setIsSend] = useState(false);
  const [toSendToken, setToSendToken] = useState<Token | NativeToken>();
  const [isReceive, setIsReceive] = useState(false);

  const { isInitialized } = useIsInitialized();
  const { currentUser } = useCurrentUser();
  const { signOut: signOutWallet } = useSignOut();

  const { disconnectAsync } = useDisconnect();

  const { mutateAsync: handleSignOut, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      if (isInitialized && currentUser) {
        await signOutWallet();
      } else {
        await disconnectAsync();
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        showCloseButton={false}
        className="left-0 w-auto right-0 md:left-auto md:w-3/4 md:max-w-sm sm:max-w-full gap-0"
      >
        <SheetHeader className="p-0">
          {open && (
            <SheetClose className="cursor-pointer size-7 justify-center items-center hidden sm:inline-flex absolute -left-16 top-7 bg-background hover:bg-accent rounded-[5px]">
              <X className="size-5" />
            </SheetClose>
          )}
          <SheetTitle></SheetTitle>
        </SheetHeader>
        <div className="p-0 h-full min-h-0 flex flex-col">
          {isSend || isReceive ? (
            <>
              <div className="flex items-center px-2 py-4 border-b">
                <div
                  className="size-8 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    setIsSend(false);
                    setIsReceive(false);
                  }}
                >
                  <ChevronLeft className="size-6" />
                </div>
                <span className="ml-2 font-semibold text-xl">
                  {isSend ? "Send" : "Receive"}
                </span>
              </div>
              <div className="p-4">
                {isSend ? (
                  <SendForm defaultToken={toSendToken} />
                ) : (
                  <ReceiveForm />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-5">
                <div className="flex gap-3">
                  <SheetClose asChild>
                    <Button
                      className="inline-flex md:hidden size-9 cursor-pointer"
                      variant="outline"
                    >
                      <ChevronRight className="size-7" />
                    </Button>
                  </SheetClose>
                  <AccountMemu />
                </div>
                <Button
                  variant="secondary"
                  className="cursor-pointer"
                  size="icon"
                  onClick={() => handleSignOut()}
                >
                  {isSigningOut ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <LogOut className="size-5" />
                  )}
                </Button>
              </div>
              <Tabs
                value={tab}
                onValueChange={setTab}
                className="w-full flex-1 min-h-0"
              >
                <TabsList className="h-auto px-4 w-full items-start justify-start gap-8 bg-transparent rounded-none py-0 border-b">
                  {TABS.map((t) => (
                    <TabsTrigger
                      key={t.id}
                      value={t.id}
                      className={cn(
                        "flex-none bg-transparent relative cursor-pointer rounded-none px-0 py-2 text-sm font-semibold transition-colors",
                        "data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                        "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                      )}
                    >
                      {t.label}
                      {tab === t.id && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-foreground"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          }}
                        />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TokensContent
                  onSend={(token) => {
                    setToSendToken(token);
                    setIsSend(true);
                  }}
                  onReceive={() => setIsReceive(true)}
                />
                <HistoryContent />
              </Tabs>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
