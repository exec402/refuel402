export interface RawTask {
  attestor_signature: string | null;
  created_at: number;
  description: string;
  executor: string | null;
  payload: string;
  status: "Pending" | "Executed" | "Expired";
  task_id: string;
  task_type: "Call" | "Transfer";
  updated_at: number;
  url: string | null;
  tx_hash: string | null;
  block_number: number | null;
}

export interface Task {
  attestorSignature: string | null;
  createdAt: number;
  description: string;
  executor: string | null;
  payload: string;
  status: "Pending" | "Executed" | "Expired";
  taskId: string;
  taskType: "Call" | "Transfer";
  updatedAt: number;
  url: string | null;
  txHash: string | null;
  blockNumber: number | null;
}
