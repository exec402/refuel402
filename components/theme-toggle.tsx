"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex items-center border border-accent rounded-lg">
      {["light", "dark"].map((t) => (
        <Button
          onClick={() => setTheme(t)}
          variant="ghost"
          key={t}
          className="h-10 cursor-pointer px-4 relative rounded-md"
        >
          {t === "light" ? (
            <Sun className="size-4 z-10 relative" />
          ) : (
            <Moon className="size-4 z-10 relative" />
          )}
          {resolvedTheme === t && (
            <motion.div
              className="absolute inset-0 rounded-md bg-accent"
              layoutId="theme-toggle"
            />
          )}
        </Button>
      ))}
    </div>
  );
}
