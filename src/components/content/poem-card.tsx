import Link from "next/link";
import Image from "next/image";
import { Headphones } from "lucide-react";
import { MemberBadge } from "@/components/ui/member-badge";
import { cn } from "@/lib/utils";
import { PLACEHOLDER } from "@/lib/placeholders";

interface PoemCardProps {
  title: string;
  collection: string;
  language: string;
  excerpt?: string;
  accessTier?: string;
  hasAudio?: boolean;
  coverImage?: string | null;
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
  coverImage,
  slug,
  className,
}: PoemCardProps) {
  return (
    <Link
      href={slug}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-card transition-all hover:border-accent-dim hover:shadow-lg",
        className,
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          src={coverImage || PLACEHOLDER.poem}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {accessTier && <MemberBadge tier={accessTier} />}
          {hasAudio && (
            <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
              <Headphones className="size-3 text-text-muted" />
            </span>
          )}
        </div>

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-xl text-white md:text-2xl leading-tight">
            {title}
          </h3>
        </div>
      </div>

      {/* Meta below image */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted">
          {collection}
        </span>
        {collection && language && (
          <span className="block size-[3px] rounded-full bg-text-muted" />
        )}
        <span className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted">
          {language}
        </span>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <p className="px-4 pb-4 -mt-1 line-clamp-2 font-serif text-[14px] italic text-text-secondary leading-relaxed">
          {excerpt}
        </p>
      )}
    </Link>
  );
}
