import Link from "next/link";
import { LockBadge } from "@/components/ui/lock-badge";
import { cn } from "@/lib/utils";

interface ResearchCardProps {
  title: string;
  tags: string[];
  abstract: string;
  doi?: string;
  year: string;
  accessTier?: string;
  slug: string;
  className?: string;
}

export function ResearchCard({
  title,
  tags,
  abstract,
  doi,
  year,
  accessTier,
  slug,
  className,
}: ResearchCardProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-t border-border pt-8", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[2px]">
            {tags.map((tag) => (
              <span key={tag} className="text-accent-dim font-medium">{tag}</span>
            ))}
            <span className="text-text-muted">{year}</span>
          </div>
          <Link
            href={slug}
            className="font-serif text-xl text-text-primary md:text-[26px]"
          >
            {title}
          </Link>
        </div>
        {accessTier && <LockBadge className="shrink-0" />}
      </div>

      <p className="font-sans text-[13px] text-text-secondary leading-relaxed max-w-[900px]">
        {abstract}
      </p>

      <div className="flex items-center gap-6">
        {doi && (
          <span className="font-mono text-[10px] tracking-[1px] text-text-muted">
            DOI: {doi}
          </span>
        )}
        <Link href={slug} className="font-sans text-[11px] text-accent hover:text-accent-glow">
          Cite &rarr;
        </Link>
        <Link href={slug} className="font-sans text-[11px] text-accent hover:text-accent-glow">
          View PDF &rarr;
        </Link>
      </div>
    </div>
  );
}
