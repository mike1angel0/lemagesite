"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-5 py-20 text-center">
      <h1 className="font-serif text-3xl text-text-primary mb-4">
        Something went wrong
      </h1>
      <p className="font-sans text-sm text-text-secondary max-w-md mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="font-mono text-xs text-accent hover:text-gold transition-colors tracking-[1px] border border-accent-dim rounded px-4 py-2"
      >
        Try again
      </button>
    </section>
  );
}
