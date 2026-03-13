import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { MemberBadge } from "@/components/ui/member-badge";
import { cn } from "@/lib/utils";

interface PoemCardProps {
  title: string;
  collection: string;
  language: string;
  excerpt?: string;
  accessTier?: string;
  hasAudio?: boolean;
  slug: string;
  className?: string;
}

export function PoemCard({
  title,
  collection,
  language,
  excerpt,
  accessTier,
  hasAudio,
  slug,
  className,
}: PoemCardProps) {
  return (
    <Link
      href={slug}
      className={cn(
        "flex items-center justify-between border-t border-border py-8",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[2px] text-text-muted">
          <span>{collection}</span>
          <span>{language}</span>
          {accessTier && <MemberBadge tier={accessTier} />}
          {hasAudio && <Headphones className="size-3 text-text-muted" />}
        </div>
        <h3 className="mt-2 font-serif text-2xl text-text-primary md:text-[28px]">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-1 font-serif text-[15px] italic text-text-secondary">
            {excerpt}
          </p>
        )}
      </div>
      <ArrowRight className="ml-6 size-5 shrink-0 text-text-muted" />
    </Link>
  );
}
