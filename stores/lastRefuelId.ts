import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useLastRefuelTaskIdStore = create<{
  lastRefuelTaskId: string;
  setLastRefuelTaskId: (id: string) => void;
}>()(
  persist(
    (set) => ({
      lastRefuelTaskId: "",
      setLastRefuelTaskId: (id: string) => set({ lastRefuelTaskId: id }),
    }),
    {
      name: "last-refuel-task-id",
    }
  )
);
