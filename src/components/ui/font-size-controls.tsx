"use client";

import { useState, useEffect } from "react";

const SIZES = ["text-sm", "text-base", "text-lg", "text-xl"] as const;
const SIZE_VALUES = ["0.875rem", "1rem", "1.125rem", "1.25rem"] as const;
const STORAGE_KEY = "selenarium-font-size";

export function FontSizeControls() {
  const [sizeIndex, setSizeIndex] = useState(1); // default to "base"

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < SIZES.length) {
        setSizeIndex(idx);
        document.documentElement.style.setProperty("--article-font-size", SIZE_VALUES[idx]);
      }
    }
  }, []);

  function setSize(idx: number) {
    setSizeIndex(idx);
    localStorage.setItem(STORAGE_KEY, String(idx));
    document.documentElement.style.setProperty("--article-font-size", SIZE_VALUES[idx]);
  }

  const btnClass =
    "font-sans text-text-secondary hover:text-text-primary transition-colors px-2 py-1";

  return (
    <div className="flex items-center gap-1 mt-4">
      <button
        type="button"
        onClick={() => setSize(Math.max(0, sizeIndex - 1))}
        className={btnClass}
        disabled={sizeIndex === 0}
        aria-label="Decrease font size"
      >
        <span className="text-xs">A-</span>
      </button>
      <button
        type="button"
        onClick={() => setSize(1)}
        className={`${btnClass} text-[10px] font-mono`}
        aria-label="Reset font size"
      >
        Aa
      </button>
      <button
        type="button"
        onClick={() => setSize(Math.min(SIZES.length - 1, sizeIndex + 1))}
        className={btnClass}
        disabled={sizeIndex === SIZES.length - 1}
        aria-label="Increase font size"
      >
        <span className="text-base">A+</span>
      </button>
    </div>
  );
}
