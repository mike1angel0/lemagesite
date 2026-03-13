import Image from "next/image";
import { cn } from "@/lib/utils";

interface QuoteInterludeProps {
  quote: string;
  attribution: string;
  imageUrl: string;
  className?: string;
}

export function QuoteInterlude({
  quote,
  attribution,
  imageUrl,
  className,
}: QuoteInterludeProps) {
  return (
    <section
      className={cn("relative h-[280px] w-full md:h-[360px]", className)}
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg/60 to-bg" />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <blockquote className="max-w-2xl text-center font-serif text-xl font-light italic text-warm-ivory md:text-2xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="mt-4 font-mono text-[10px] tracking-[2px] text-text-muted">
          {attribution}
        </p>
      </div>
    </section>
  );
}
