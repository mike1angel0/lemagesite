import { getRandomQuote } from "@/lib/data";
import { PLACEHOLDER } from "@/lib/placeholders";

interface RotatingQuoteProps {
  fallbackQuote?: string;
  fallbackAuthor?: string;
  className?: string;
}

export async function RotatingQuote({
  fallbackQuote,
  fallbackAuthor,
  className,
}: RotatingQuoteProps) {
  const quote = await getRandomQuote();

  const text = quote?.text || fallbackQuote;
  const author = quote?.attribution || fallbackAuthor;

  if (!text) return null;

  return (
    <section
      className={`relative h-[240px] w-full flex items-center justify-center bg-bg-card border-y border-border ${className || ""}`}
    >
      <div className="flex flex-col items-center gap-4 px-6 max-w-2xl text-center">
        <blockquote className="font-serif text-xl font-light italic text-text-primary leading-[1.7]">
          &ldquo;{text}&rdquo;
        </blockquote>
        {author && (
          <p className="font-mono text-[10px] tracking-[2px] text-accent-dim">
            &mdash; {author}
          </p>
        )}
      </div>
    </section>
  );
}
