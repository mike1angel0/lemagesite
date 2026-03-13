import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookCardProps {
  title: string;
  coverImage: string;
  type: string;
  year: string;
  description: string;
  quote?: string;
  buttons?: string[];
  slug: string;
  className?: string;
}

function getButtonHref(label: string, slug: string): string {
  switch (label) {
    case "Buy Print":
      return "/shop";
    case "Read Excerpt":
      return slug;
    case "Member Excerpt":
      return "/membership";
    default:
      return slug;
  }
}

export function BookCard({
  title,
  coverImage,
  type,
  year,
  description,
  quote,
  buttons = ["Buy Print", "Read Excerpt"],
  slug,
  className,
}: BookCardProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Link href={slug} className="relative h-[520px] w-full overflow-hidden border border-border">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Link>

      <div className="flex flex-col gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[3px] text-accent-dim font-medium">
          {type.toUpperCase()} &middot; {year}
        </span>
        <h3 className="font-serif text-[28px] text-text-primary">
          <Link href={slug}>{title}</Link>
        </h3>
        <p className="font-sans text-[13px] text-text-secondary leading-[1.5] max-w-[340px]">
          {description}
        </p>
        {quote && (
          <p className="font-serif text-sm italic text-accent-dim">
            {quote}
          </p>
        )}
        <div className="flex gap-3 mt-1">
          {buttons.map((label, i) =>
            i === 0 ? (
              <Button key={label} variant="filled" size="sm" asChild>
                <Link href={getButtonHref(label, slug)}>{label}</Link>
              </Button>
            ) : (
              <Button key={label} variant="ghost" size="sm" asChild>
                <Link href={getButtonHref(label, slug)}>{label}</Link>
              </Button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
