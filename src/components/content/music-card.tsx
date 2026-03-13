import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MusicCardProps {
  title: string;
  coverImage: string;
  year: string;
  description: string;
  slug: string;
  className?: string;
}

export function MusicCard({
  title,
  coverImage,
  year,
  description,
  slug,
  className,
}: MusicCardProps) {
  return (
    <Link href={slug} className={cn("flex flex-col", className)}>
      <div className="relative size-[380px] max-w-full overflow-hidden border border-border">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover"
          sizes="380px"
        />
      </div>

      <div className="mt-5">
        <span className="font-mono text-[9px] uppercase tracking-[2px] text-accent-dim">
          {year}
        </span>
        <h3 className="mt-2 font-serif text-3xl font-light text-text-primary md:text-[40px]">
          {title}
        </h3>
        <p className="mt-3 font-sans text-sm text-text-secondary">
          {description}
        </p>
      </div>
    </Link>
  );
}
