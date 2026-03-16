"use client";

import { useEffect } from "react";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-5 py-20 text-center">
      <h1 className="font-serif text-2xl text-text-primary mb-4">
        Admin Error
      </h1>
      <p className="font-sans text-sm text-text-secondary max-w-md mb-8">
        Something went wrong loading this admin page.
      </p>
      <button
        onClick={reset}
        className="font-mono text-xs text-accent hover:text-gold transition-colors tracking-[1px] border border-accent-dim rounded px-4 py-2"
      >
        Try again
      </button>
    </div>
  );
}
