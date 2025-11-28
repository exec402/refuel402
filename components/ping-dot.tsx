import { cn } from "@/lib/utils";

export default function PingDot({ className }: { className?: string }) {
  return (
    <div className={cn("size-6 rounded-full bg-linear-to-br from-green-300 to-green-500 relative", className)}>
      <div className="absolute -inset-1 rounded-full animate-ping bg-green-500" />
    </div>
  );
}
