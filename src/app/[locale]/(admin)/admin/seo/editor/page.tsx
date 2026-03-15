"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  { id: "home", label: "Home", path: "/" },
  { id: "poetry", label: "Poetry", path: "/poetry" },
  { id: "photography", label: "Photography", path: "/photography" },
  { id: "music", label: "Music", path: "/music" },
  { id: "books", label: "Books — Library", path: "/books" },
  { id: "research", label: "Research", path: "/research" },
  { id: "essays", label: "Essays — Journal", path: "/essays" },
  { id: "about", label: "About — Biography", path: "/about" },
  { id: "membership", label: "Membership", path: "/membership" },
  { id: "contact", label: "Contact", path: "/contact" },
];

type PageSEO = {
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  schemaType: string;
  score: number;
};

const defaultSEO: Record<string, PageSEO> = {
  home: {
    seoTitle:
      "Selenarium — Poetry, Photography & Sound | lemagepoet (Mihai Gavrilescu)",
    metaDescription:
      "A digital selenarium for contemporary poetry, photography, music and cinema by lemagepoet (Mihai Gavrilescu). Explore curated collections, essays, and multimedia experiences.",
    ogTitle:
      "Selenarium — Poetry, Photography & Sound",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art",
    robots: "index, follow",
    schemaType: "WebSite",
    score: 92,
  },
  poetry: {
    seoTitle: "Poetry Collection — Selenarium",
    metaDescription:
      "Contemporary poetry exploring silence, memory, and the geometry of longing. Original works by lemagepoet.",
    ogTitle: "Poetry — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/poetry",
    robots: "index, follow",
    schemaType: "CollectionPage",
    score: 88,
  },
  photography: {
    seoTitle: "Photography — Selenarium",
    metaDescription:
      "Fine art photography series including Fog Studies, Winter Light, and Urban Solitude. Medium format film and digital works.",
    ogTitle: "Photography — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/photography",
    robots: "index, follow",
    schemaType: "CollectionPage",
    score: 85,
  },
  music: {
    seoTitle: "Music & Sound — Selenarium",
    metaDescription:
      "Ambient soundscapes, field recordings, and experimental music compositions.",
    ogTitle: "Music — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/music",
    robots: "index, follow",
    schemaType: "CollectionPage",
    score: 78,
  },
  books: {
    seoTitle: "Library — Books & Reading — Selenarium",
    metaDescription:
      "Curated reading lists, book reviews, and literary recommendations.",
    ogTitle: "Library — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/books",
    robots: "index, follow",
    schemaType: "CollectionPage",
    score: 72,
  },
  research: {
    seoTitle: "Research — Selenarium",
    metaDescription:
      "Research notes, investigations, and explorations in art, language, and perception.",
    ogTitle: "Research — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/research",
    robots: "index, follow",
    schemaType: "CollectionPage",
    score: 68,
  },
  essays: {
    seoTitle: "Essays — Journal — Selenarium",
    metaDescription:
      "Long-form essays on silence, observation, and the creative process.",
    ogTitle: "Journal — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/essays",
    robots: "index, follow",
    schemaType: "Blog",
    score: 90,
  },
  about: {
    seoTitle: "About — lemagepoet (Mihai Gavrilescu) — Selenarium",
    metaDescription:
      "Biography and artistic statement. Poet, photographer, and sound artist based in Romania.",
    ogTitle: "About lemagepoet",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/about",
    robots: "index, follow",
    schemaType: "ProfilePage",
    score: 82,
  },
  membership: {
    seoTitle: "Membership — Selenarium",
    metaDescription:
      "Join Selenarium community. Access exclusive poetry, photography, and behind-the-scenes content.",
    ogTitle: "Become a Member — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/membership",
    robots: "index, follow",
    schemaType: "WebPage",
    score: 86,
  },
  contact: {
    seoTitle: "Contact — Selenarium",
    metaDescription:
      "Get in touch for collaborations, press inquiries, or just to say hello.",
    ogTitle: "Contact — Selenarium",
    ogImage: "",
    canonicalUrl: "https://theselenarium.art/contact",
    robots: "index, follow",
    schemaType: "ContactPage",
    score: 74,
  },
};

const robotsOptions = [
  "index, follow",
  "index, nofollow",
  "noindex, follow",
  "noindex, nofollow",
];

const schemaOptions = [
  "WebSite",
  "WebPage",
  "Article",
  "Blog",
  "CollectionPage",
  "ProfilePage",
  "ContactPage",
  "FAQPage",
  "Product",
];

function scoreColor(score: number) {
  if (score >= 90) return "bg-[#6BBF7B]/10 text-[#6BBF7B]";
  if (score >= 75) return "bg-gold/10 text-gold";
  return "bg-[#E57373]/10 text-[#E57373]";
}

export default function SEOEditorPage() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [seoData, setSeoData] = useState<Record<string, PageSEO>>(defaultSEO);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = seoData[selectedPage];
  const pageInfo = pages.find((p) => p.id === selectedPage)!;

  const updateField = (field: keyof PageSEO, value: string) => {
    setSeoData((prev) => ({
      ...prev,
      [selectedPage]: { ...prev[selectedPage], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-border">
        <h1 className="font-sans text-[18px] font-semibold text-text-primary">
          SEO Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* ── Two-Column ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left Sidebar: Page List ── */}
        <div className="w-[240px] bg-bg-surface border-r border-border p-4 overflow-y-auto">
          <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase mb-3">
            Pages
          </p>
          <nav className="space-y-0.5">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={cn(
                  "w-full text-left py-2 px-3 rounded text-[13px] font-sans transition-colors",
                  selectedPage === page.id
                    ? "bg-bg-elevated text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50",
                )}
              >
                {page.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Right: Editor ── */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-[16px] font-medium text-text-primary">
              {pageInfo.label}
            </h2>
            <span
              className={cn(
                "font-mono text-[10px] tracking-wide px-2 py-0.5 rounded",
                scoreColor(current.score),
              )}
            >
              Score: {current.score}/100
            </span>
            <a
              href={pageInfo.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-sans text-xs text-accent hover:underline ml-auto"
            >
              Open Page
              <ExternalLink size={12} />
            </a>
          </div>

          {/* SEO Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                SEO Title
              </label>
              <span
                className={cn(
                  "font-mono text-[10px]",
                  current.seoTitle.length > 60
                    ? "text-[#E57373]"
                    : "text-text-muted",
                )}
              >
                {current.seoTitle.length}/60
              </span>
            </div>
            <input
              type="text"
              value={current.seoTitle}
              onChange={(e) => updateField("seoTitle", e.target.value)}
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                Meta Description
              </label>
              <span
                className={cn(
                  "font-mono text-[10px]",
                  current.metaDescription.length > 160
                    ? "text-[#E57373]"
                    : "text-text-muted",
                )}
              >
                {current.metaDescription.length}/160
              </span>
            </div>
            <textarea
              value={current.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              className="w-full h-20 border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary resize-none focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Social Preview */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Social Preview
            </p>
            <div className="bg-bg-card border border-border rounded-lg p-4 space-y-1.5">
              <p className="font-sans text-sm text-[#8AB4F8] truncate">
                {current.seoTitle || "Page Title"}
              </p>
              <p className="font-mono text-[11px] text-[#6BBF7B] truncate">
                {current.canonicalUrl || "https://theselenarium.art"}
              </p>
              <p className="font-sans text-xs text-text-muted line-clamp-2">
                {current.metaDescription || "Page description will appear here."}
              </p>
            </div>
          </div>

          {/* Open Graph */}
          <div className="space-y-4">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Open Graph
            </p>

            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary">
                OG Title
              </label>
              <input
                type="text"
                value={current.ogTitle}
                onChange={(e) => updateField("ogTitle", e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary">
                OG Image URL
              </label>
              <input
                type="text"
                value={current.ogImage}
                onChange={(e) => updateField("ogImage", e.target.value)}
                placeholder="https://theselenarium.art/og/home.jpg"
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
              {!current.ogImage && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2">
                  <p className="font-sans text-xs text-text-muted">
                    Drag & drop an image or enter a URL above
                  </p>
                  <p className="font-mono text-[10px] text-text-muted">
                    Recommended: 1200 x 630px
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Advanced */}
          <div className="space-y-4">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Advanced
            </p>

            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary">
                Canonical URL
              </label>
              <input
                type="text"
                value={current.canonicalUrl}
                onChange={(e) => updateField("canonicalUrl", e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary">
                Robots Meta
              </label>
              <select
                value={current.robots}
                onChange={(e) => updateField("robots", e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                {robotsOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary">
                Schema Type
              </label>
              <select
                value={current.schemaType}
                onChange={(e) => updateField("schemaType", e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                {schemaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
