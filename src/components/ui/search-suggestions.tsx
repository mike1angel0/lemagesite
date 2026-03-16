"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "selenarium_recent_searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function SearchSuggestions() {
  const t = useTranslations("search");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-[10px] text-text-muted tracking-[1px] uppercase">
        {t("recentSearches")}
      </span>
      {recent.map((q) => (
        <a
          key={q}
          href={`?q=${encodeURIComponent(q)}`}
          className="font-sans text-xs text-accent bg-bg-elevated border border-border rounded-full px-3 py-1 hover:border-accent-dim transition-colors"
        >
          {q}
        </a>
      ))}
      <button
        onClick={() => {
          clearRecentSearches();
          setRecent([]);
        }}
        className="font-mono text-[10px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
      >
        <X className="size-3" />
        {t("clearRecent")}
      </button>
    </div>
  );
}
