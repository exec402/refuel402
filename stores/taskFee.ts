import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTaskFeeStore = create<{
  taskFee: string;
  isAutoTaskFee: boolean;
  setTaskFee: (id: string) => void;
  toggleIsAutoTaskFee: () => void;
}>()(
  persist(
    (set, get) => ({
      taskFee: "0.3",
      isAutoTaskFee: true,
      setTaskFee: (fee: string) => set({ taskFee: fee }),
      toggleIsAutoTaskFee: () => set({ isAutoTaskFee: !get().isAutoTaskFee }),
    }),
    {
      name: "task-fee",
    }
  )
);
