"use client";

import { useEffect, useMemo, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useExecClient } from "@exec402/react";
import { useAccount } from "wagmi";
import type { Task, TaskStatus } from "@exec402/core";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Clock, CheckCircle, Loader2 } from "lucide-react";
import { CHAIN_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "moment";

const LIMIT = 10;

function getBlockExplorerTxUrl(chainId: number, txHash: string): string | null {
  const chain = CHAIN_MAP[chainId];
  if (!chain?.blockExplorers?.default?.url) return null;
  return `${chain.blockExplorers.default.url}/tx/${txHash}`;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        status === "Executed" &&
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        status === "Pending" &&
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        status === "Expired" &&
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      )}
    >
      {status === "Executed" && <CheckCircle className="size-3" />}
      {status === "Pending" && <Clock className="size-3" />}
      {status}
    </span>
  );
}

function TaskRow({ task }: { task: Task }) {
  const txUrl = task.txHash
    ? getBlockExplorerTxUrl(task.chainId, task.txHash)
    : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 justify-between">
          <span className="font-medium text-sm truncate">
            {task.description || `Task ${task.taskId.slice(0, 8)}...`}
          </span>
          <StatusBadge status={task.status} />
        </div>
        <div className="justify-between flex items-center">
          <span className="text-xs text-muted-foreground">
            {moment(task.createdAt).fromNow()}
          </span>
          <span>
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline inline-flex items-center"
              >
                View on Explorer
                <ExternalLink className="size-3 ml-1" />
              </a>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function TaskRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export default function HistoryContent() {
  const { address } = useAccount();
  const client = useExecClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["tasks", address],
      queryFn: ({ pageParam = 0 }) =>
        client.listTasks({
          initiator: address,
          limit: LIMIT,
          offset: pageParam,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      enabled: !!address,
      refetchInterval: 5000,
    });

  const tasks = useMemo(
    () => data?.pages.flatMap((page) => page.tasks) ?? [],
    [data]
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <TabsContent
      value="history"
      className="flex flex-col flex-1 h-full overflow-hidden"
    >
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <TaskRowSkeleton key={idx} />
          ))
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <Clock className="size-12 mb-4 opacity-50" />
            <p>No tasks yet</p>
          </div>
        ) : (
          <>
            {tasks.map((task) => (
              <TaskRow key={task.taskId} task={task} />
            ))}
            <div ref={loadMoreRef} className="py-2">
              {isFetchingNextPage && (
                <div className="flex justify-center py-2">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!hasNextPage && tasks.length > 0 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  No more tasks
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </TabsContent>
  );
}
