"use client";

import { useState, useEffect, useMemo } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PingDot from "@/components/ping-dot";
import { useLastRefuelTaskIdStore } from "@/stores/lastRefuelId";
import { getTaskExpirationTime } from "@exec402/core";
import { useTask, useVerifyTask } from "@exec402/react";
import SuccessIcon from "@/components/succuess-icon";

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

export default function StatusModal() {
  const { lastRefuelTaskId, setLastRefuelTaskId } = useLastRefuelTaskIdStore();
  const [isClosing, setIsClosing] = useState(false);

  const open = !!lastRefuelTaskId && !isClosing;

  const { data: task } = useTask(lastRefuelTaskId ? lastRefuelTaskId : "", {
    refetchInterval: 3000,
  });

  const { data: isExecuted } = useVerifyTask(
    task?.status === "Pending"
      ? (lastRefuelTaskId as `0x${string}`)
      : undefined,
    { pollingInterval: 2000 }
  );

  const expirationTime = useMemo(
    () => (task?.status === "Pending" ? getTaskExpirationTime(task) : 0),
    [task]
  );

  const onClose = () => {
    setIsClosing(true);
  };

  const onAnimationEnd = () => {
    if (isClosing) {
      setLastRefuelTaskId("");
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-sm outline-none"
        onAnimationEnd={onAnimationEnd}
      >
        <DialogTitle className="sr-only">Task Status</DialogTitle>
        <DialogDescription className="sr-only">
          Refuel task status
        </DialogDescription>
        <div className="flex flex-col justify-center items-center space-y-4 py-6">
          {!task || (task.status === "Pending" && !isExecuted) ? (
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
          ) : task.status === "Executed" || isExecuted ? (
            <>
              <SuccessIcon />
              <div className="text-center">
                <p className="text-2xl font-semibold">Success</p>
                <span className="text-muted-foreground">
                  Refuel task executed.
                </span>
              </div>
              <Button onClick={onClose} className="mt-2">
                Refuel another
              </Button>
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
              <Button onClick={onClose} className="mt-2">
                Try again
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}