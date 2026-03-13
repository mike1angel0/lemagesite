import Link from "next/link";
import { House, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* -- Main Content -- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5">
        <span className="font-serif text-[120px] font-bold text-bg-elevated leading-none tracking-[8px]">
          404
        </span>

        <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-text-primary">
          Lost Among the Stars
        </h1>

        <p className="font-sans text-[15px] text-text-secondary leading-relaxed text-center max-w-[500px]">
          The page you&rsquo;re looking for has drifted beyond the observable
          universe. Perhaps it was a poem that never finished, or a constellation
          we haven&rsquo;t mapped yet.
          <br />
          <br />
          As the little prince once said: &ldquo;Where are the people? It&rsquo;s a little lonely
          in the desert.&rdquo;
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gold text-bg font-sans text-sm font-semibold rounded-md px-7 py-3 hover:bg-honey transition-colors"
          >
            <House className="size-3.5" />
            Return Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-border text-accent font-sans text-sm rounded-md px-5 py-3 hover:border-accent-dim transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
