"use client";

import { Plus, Filter, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const filterTabs = ["All Files", "Images", "Audio", "Documents", "Video"];

const mediaFiles = [
  { name: "fog-studies-i.jpg", size: "2.4 MB" },
  { name: "portrait-winter-light.jpg", size: "3.1 MB" },
  { name: "book-cover-cartography.jpg", size: "1.8 MB" },
  { name: "lecture-notes-memories.jpg", size: "4.2 MB" },
  { name: "night-selenarium.jpg", size: "2.9 MB" },
  { name: "ceramic-collection.jpg", size: "1.5 MB" },
  { name: "essay-draft-meditation.jpg", size: "0.8 MB" },
  { name: "music-art-nocturne.jpg", size: "3.6 MB" },
];

/* ------------------------------------------------------------------ */
/*  Page (Client Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminMediaPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Media Library
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Upload coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg"
          >
            <Plus className="h-3.5 w-3.5" />
            New Upload
          </button>
          <button
            onClick={() => alert("Filter coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 px-8 mt-6">
        {filterTabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => alert("Filter coming soon")}
            className={cn(
              "rounded-md px-3.5 py-1.5 font-sans text-[12px] transition-colors",
              i === 0
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Info Row ── */}
      <div className="px-8 mt-4">
        <p className="font-sans text-[12px] text-text-muted">
          827 files &middot; 4.2 GB used of 10 GB
        </p>
      </div>

      {/* ── Media Grid ── */}
      <div className="grid grid-cols-4 gap-4 px-8 mt-4 pb-8">
        {mediaFiles.map((file) => (
          <div
            key={file.name}
            onClick={() => alert("Open media coming soon")} className="rounded-lg border border-border overflow-hidden hover:border-accent-dim transition-colors cursor-pointer"
          >
            <div className="h-[140px] bg-bg-elevated flex items-center justify-center rounded-t">
              <ImageIcon className="h-8 w-8 text-text-muted" />
            </div>
            <div className="p-3 bg-bg-card">
              <p className="font-sans text-[12px] text-text-primary truncate">
                {file.name}
              </p>
              <p className="font-mono text-[10px] text-text-muted mt-0.5">
                {file.size}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
