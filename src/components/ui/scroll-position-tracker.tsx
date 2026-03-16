"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "selenarium-scroll-positions";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SavedPosition {
  scrollPercent: number;
  timestamp: number;
}

function getPositions(): Record<string, SavedPosition> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function ScrollPositionTracker({ slug }: { slug: string }) {
  const t = useTranslations("common");
  const [showBanner, setShowBanner] = useState(false);
  const [savedPercent, setSavedPercent] = useState(0);

  // Save scroll position (debounced)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function handleScroll() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const percent = Math.round((window.scrollY / docHeight) * 100);
        if (percent < 5) return; // don't save if at top
        const positions = getPositions();
        positions[slug] = { scrollPercent: percent, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      }, 1000);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [slug]);

  // Show banner on load
  useEffect(() => {
    const positions = getPositions();
    const saved = positions[slug];
    if (
      saved &&
      saved.scrollPercent > 5 &&
      saved.scrollPercent < 95 &&
      Date.now() - saved.timestamp < MAX_AGE_MS
    ) {
      setSavedPercent(saved.scrollPercent);
      setShowBanner(true);

      // Auto-dismiss after 5s
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  const scrollToPosition = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (savedPercent / 100) * docHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
    setShowBanner(false);
  }, [savedPercent]);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in no-print">
      <button
        type="button"
        onClick={scrollToPosition}
        className="flex items-center gap-3 bg-bg-card border border-border rounded-full px-6 py-3 shadow-lg hover:border-accent transition-colors"
      >
        <span className="font-sans text-sm text-text-primary">
          {t("continueReading")} ({savedPercent}%)
        </span>
        <span
          className="text-text-muted text-xs cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowBanner(false);
          }}
        >
          &times;
        </span>
      </button>
    </div>
  );
}
