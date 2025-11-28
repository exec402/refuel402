import { create } from "zustand";

type ConnectWalletModalStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useConnectWalletModalStore = create<ConnectWalletModalStore>(
  (set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
  })
);
