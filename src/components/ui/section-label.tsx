import { cn } from "@/lib/utils";

interface SectionLabelProps {
  label: string;
  className?: string;
}

export function SectionLabel({ label, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="block w-8 h-px bg-accent-dim" />
      <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
        {label}
      </span>
    </div>
  );
}
