import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventCardProps {
  title: string;
  date: string | Date;
  location: string;
  slug: string;
  rsvpUrl?: string;
  isPast?: boolean;
  className?: string;
}

export function EventCard({
  title,
  date,
  location,
  slug,
  rsvpUrl,
  isPast,
  className,
}: EventCardProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const month = dateObj.toLocaleString("en-US", { month: "short" });
  const day = dateObj.getDate();

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="flex shrink-0 flex-col items-center">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-accent-dim">
          {month}
        </span>
        <span className="font-serif text-3xl text-text-primary">{day}</span>
      </div>

      <div className="flex flex-1 flex-col">
        <Link
          href={slug}
          className="font-serif text-xl text-text-primary md:text-[22px]"
        >
          {title}
        </Link>
        <span className="mt-1 font-sans text-xs text-text-secondary">
          {location}
        </span>
      </div>

      {rsvpUrl && !isPast && (
        <a href={rsvpUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">
            RSVP
          </Button>
        </a>
      )}

      {isPast && (
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
          Past
        </span>
      )}
    </div>
  );
}
