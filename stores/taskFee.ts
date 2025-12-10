import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTaskFeeStore = create<{
  taskFee: string;
  isAutoTaskFee: boolean;
  setTaskFee: (id: string) => void;
  toggleIsAutoTaskFee: (force?: boolean) => void;
}>()(
  persist(
    (set, get) => ({
      taskFee: "0.3",
      isAutoTaskFee: true,
      setTaskFee: (fee: string) => set({ taskFee: fee }),
      toggleIsAutoTaskFee: (force?: boolean) =>
        set({ isAutoTaskFee: force ?? !get().isAutoTaskFee }),
    }),
    {
      name: "task-fee",
    }
  )
);
