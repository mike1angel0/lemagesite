import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockBadgeProps {
  label?: string;
  className?: string;
}

export function LockBadge({
  label = "PATRON ONLY",
  className,
}: LockBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 bg-bg-elevated px-2.5 py-1",
        className,
      )}
    >
      <Lock className="size-3 text-muted" />
      <span className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-muted">
        {label}
      </span>
    </span>
  );
}
