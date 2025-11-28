import { CANISTER_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Task, RawTask } from "@/types/task";

function rawToTask(raw: RawTask): Task {
  return {
    attestorSignature: raw.attestor_signature,
    createdAt: raw.created_at,
    description: raw.description,
    executor: raw.executor,
    payload: raw.payload,
    status: raw.status,
    taskId: raw.task_id,
    taskType: raw.task_type,
    updatedAt: raw.updated_at,
    url: raw.url,
    txHash: raw.tx_hash,
    blockNumber: raw.block_number,
  };
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const raw = await axios
        .get<{
          data: RawTask;
        }>(`${CANISTER_URL}/tasks/${taskId}`)
        .then((res) => res.data.data)
        .catch(() => {
          return {
            status: "Expired",
          } as unknown as RawTask;
        });

      return rawToTask(raw);
    },
    refetchInterval: 2000,
  });
}

export function useTasks(status: Task["status"] = "Pending") {
  return useQuery({
    queryKey: ["tasks", status],
    queryFn: async () => {
      return await axios
        .get<{
          data: {
            tasks: RawTask[];
          };
        }>(`${CANISTER_URL}/tasks?status=${status}`)
        .then((res) => res.data.data.tasks.map(rawToTask))
        .catch(() => []);
    },
    refetchInterval: 2000,
  });
}
