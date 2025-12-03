"use client";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Timer, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PingDot from "@/components/ping-dot";
import { useLastRefuelTaskIdStore } from "@/stores/lastRefuelId";
import { getTaskExpirationTime } from "@exec402/core";
import { useTask } from "@exec402/react";
function CountDown({ ts }: { ts: number }) {
  const [seconds, setSeconds] = useState(
    Math.round(ts - new Date().getTime() / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>Will be expired in {seconds > 0 ? seconds : 0}s</span>;
}

export default function Status({ id }: { id: string }) {
  const { data: task } = useTask(id, { refetchInterval: 1000 });
  const { setLastRefuelTaskId } = useLastRefuelTaskIdStore();

  const router = useRouter();

  useEffect(() => {
    if (task?.status === "Executed" || task?.status === "Expired") {
      setTimeout(() => {
        setLastRefuelTaskId("");
      }, 1500);
    }
  }, [task, setLastRefuelTaskId]);

  const expirationTime = useMemo(
    () => (task ? getTaskExpirationTime(task) : 0),
    [task]
  );

  const onBack = () => {
    setLastRefuelTaskId("");
    router.push("/");
  };

  return (
    <motion.div
      className="rounded-lg border bg-white dark:bg-accent/50 p-6 space-y-6 py-12"
      key="refuel-form"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <div className="flex flex-col justify-center items-center space-y-3">
        {!task || task.status === "Pending" ? (
          <>
            <div className="size-12 flex items-center justify-center">
              <PingDot className="size-8" />
            </div>
            <div className="text-center flex flex-col space-y-2">
              <p className="text-2xl font-semibold">Pending</p>
              {!task ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <p className="text-muted-foreground">
                  <CountDown ts={expirationTime} />
                </p>
              )}
            </div>
          </>
        ) : task.status === "Executed" ? (
          <>
            <CircleCheck className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-2xl font-semibold">Success</p>
              <span className="text-muted-foreground">
                Refuel task executed.
              </span>
            </div>
            <Button onClick={onBack}>Refuel another</Button>
          </>
        ) : (
          <>
            <Timer className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-2xl font-semibold">Expired</p>
              <span className="text-muted-foreground">
                Refuel task expired.
              </span>
            </div>
            <Button onClick={onBack}>Try again</Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
