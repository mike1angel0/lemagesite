import { cn } from "@/lib/utils";

interface MemberBadgeProps {
  tier: string;
  className?: string;
}

export function MemberBadge({ tier, className }: MemberBadgeProps) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-medium uppercase tracking-[2px] text-accent-dim",
        "border border-accent-dim px-2.5 py-1",
        className,
      )}
    >
      {tier}
    </span>
  );
}
