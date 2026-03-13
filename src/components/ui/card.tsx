import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export function Card({ children, className, padding = "p-8" }: CardProps) {
  return (
    <div className={cn("bg-bg-card rounded border border-border", padding, className)}>
      {children}
    </div>
  );
}
