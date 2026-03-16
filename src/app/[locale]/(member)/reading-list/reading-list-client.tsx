"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Feather, FileText, FlaskConical, Camera } from "lucide-react";

type SavedItemData = {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  href: string;
  thumbnail: string | null;
  savedAt: string;
};

const typeIcons: Record<string, React.ElementType> = {
  POEM: Feather,
  ESSAY: FileText,
  RESEARCH: FlaskConical,
  PHOTO: Camera,
};

const typeLabels: Record<string, string> = {
  POEM: "Poetry",
  ESSAY: "Essay",
  RESEARCH: "Research",
  PHOTO: "Photography",
};

function getReadingProgress(slug: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = `scroll_position_${slug}`;
    const val = localStorage.getItem(key);
    if (!val) return 0;
    const parsed = JSON.parse(val);
    return Math.min(100, Math.round((parsed.position || 0) * 100));
  } catch {
    return 0;
  }
}

export function ReadingListClient({
  items,
  emptyMessage,
  progressLabel,
}: {
  items: SavedItemData[];
  emptyMessage: string;
  progressLabel: string;
}) {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    for (const item of items) {
      const slugMap: Record<string, string> = {
        ESSAY: `essay-${item.href.split("/").pop()}`,
        RESEARCH: `research-${item.href.split("/").pop()}`,
        POEM: `poem-${item.href.split("/").pop()}`,
      };
      const slug = slugMap[item.contentType];
      if (slug) {
        p[item.id] = getReadingProgress(slug);
      }
    }
    setProgress(p);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <BookOpen className="size-12 text-text-muted" />
        <p className="font-sans text-sm text-text-muted text-center max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const Icon = typeIcons[item.contentType] ?? BookOpen;
        const pct = progress[item.id] ?? 0;
        return (
          <Link key={item.id} href={item.href}>
            <div className="border border-border rounded-lg overflow-hidden hover:border-accent-dim transition-colors group">
              {item.thumbnail && (
                <div className="relative h-[140px] bg-bg-surface">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="size-3 text-gold" />
                  <span className="font-mono text-[9px] text-gold tracking-[2px] uppercase">
                    {typeLabels[item.contentType] ?? item.contentType}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {pct > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-border rounded-full">
                      <div className="h-1 bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-[9px] text-text-muted">
                      {progressLabel.replace("{percent}", String(pct))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
