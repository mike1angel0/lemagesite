import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface EssayCardProps {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  thumbnail?: string;
  slug: string;
  date?: string;
  className?: string;
}

export function EssayCard({
  title,
  category,
  excerpt,
  readTime,
  thumbnail,
  slug,
  date,
  className,
}: EssayCardProps) {
  return (
    <Link
      href={slug}
      className={cn(
        "flex flex-col gap-6 md:flex-row md:gap-10",
        className,
      )}
    >
      {thumbnail && (
        <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded md:w-[280px]">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 280px"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <span className="font-mono text-[9px] uppercase tracking-[2px] text-accent-dim">
          {category}
        </span>
        <h3 className="mt-2 font-serif text-xl text-text-primary md:text-2xl">
          {title}
        </h3>
        <p className="mt-3 line-clamp-3 font-sans text-sm text-text-secondary">
          {excerpt}
        </p>
        <div className="mt-4 flex gap-4 font-mono text-[10px] text-text-muted">
          <span>{readTime}</span>
          {date && <span>{date}</span>}
        </div>
      </div>
    </Link>
  );
}
