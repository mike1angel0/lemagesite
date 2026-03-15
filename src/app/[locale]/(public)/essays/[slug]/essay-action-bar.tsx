"use client";

import { ShareButtons } from "@/components/ui/share-buttons";
import { EssayImageGenerator } from "@/components/ui/essay-image-generator";
import { SaveButton } from "@/components/ui/save-button";

interface EssayActionBarProps {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  shareLabels: { x: string; facebook: string; copyLink: string };
  shareLabel: string;
}

export function EssayActionBar({
  title,
  excerpt,
  category,
  readTime,
  shareLabels,
  shareLabel,
}: EssayActionBarProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
          {shareLabel}
        </span>
        <ShareButtons labels={shareLabels} />
      </div>
      <EssayImageGenerator
        title={title}
        excerpt={excerpt}
        category={category}
        readTime={readTime}
      />
      <SaveButton contentType="ESSAY" contentId="placeholder-essay-id" saved={false} />
    </div>
  );
}
