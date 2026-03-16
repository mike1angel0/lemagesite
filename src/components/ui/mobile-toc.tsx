"use client";

import { useState, useEffect, useCallback } from "react";
import { List, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface TocItem {
  label: string;
  id: string;
}

export function MobileToc({ items }: { items: TocItem[] }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating button - mobile only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-bg-card border border-border rounded-full p-3 shadow-lg hover:border-accent transition-colors no-print"
        aria-label={t("tableOfContents")}
      >
        <List className="size-5 text-accent" />
      </button>

      {/* Bottom sheet drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg-card border-t border-border rounded-t-2xl max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-mono text-[10px] text-text-muted tracking-[3px] uppercase">
                {t("tableOfContents")}
              </span>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="size-5 text-text-muted" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`text-left font-sans text-sm py-2.5 px-3 rounded transition-colors ${
                    activeId === item.id
                      ? "text-accent bg-bg-surface"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
