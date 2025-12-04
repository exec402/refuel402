"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SuccessIcon({
  show = true,
  className,
  size = 64,
}: {
  show?: boolean;
  className?: string;
  size?: number;
}) {
  const outerSize = size * 1.25;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={cn(
            "relative inline-flex items-center justify-center",
            className
          )}
          style={{ width: outerSize, height: outerSize }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-emerald-100/50"
            style={{ width: outerSize, height: outerSize }}
          >
            <motion.div
              className="flex items-center justify-center rounded-full bg-emerald-400 shadow-sm"
              style={{ width: size, height: size }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="size-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 13.5L9.5 18L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                />
              </motion.svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
