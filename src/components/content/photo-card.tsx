import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  title: string;
  imageUrl: string;
  series?: string;
  slug: string;
  className?: string;
  aspectRatio?: string;
}

export function PhotoCard({
  title,
  imageUrl,
  series,
  slug,
  className,
  aspectRatio,
}: PhotoCardProps) {
  return (
    <Link
      href={slug}
      className={cn("group relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      <div className="absolute inset-0 border border-border" />

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="font-serif text-lg text-white">{title}</h3>
        {series && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
            {series}
          </p>
        )}
      </div>
    </Link>
  );
}
