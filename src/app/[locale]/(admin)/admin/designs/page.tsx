"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All" },
  { id: "components", label: "Components" },
  { id: "public", label: "Public Pages" },
  { id: "detail", label: "Detail Pages" },
  { id: "gated", label: "Gated Content" },
  { id: "auth", label: "Auth / Account" },
  { id: "legal", label: "Legal / Misc" },
  { id: "logos", label: "Logos" },
  { id: "admin", label: "Admin" },
] as const;

type Category = (typeof categories)[number]["id"];

const screens: { id: string; name: string; category: Category }[] = [
  // Components
  { id: "73BaZ", name: "Component/Nav", category: "components" },
  { id: "fL6Np", name: "Component/Footer", category: "components" },
  { id: "7BQ0x", name: "Component/SectionLabel", category: "components" },
  { id: "P5ruB", name: "Component/MemberBadge", category: "components" },
  { id: "TGLNu", name: "Component/LockBadge", category: "components" },

  // Public Pages
  { id: "2WMFV", name: "Home — Observatory", category: "public" },
  { id: "HQ2EF", name: "Poetry — Collection", category: "public" },
  { id: "GYLRx", name: "Photography — Gallery", category: "public" },
  { id: "0olVw", name: "Music — Discography", category: "public" },
  { id: "x2elE", name: "Books — Library", category: "public" },
  { id: "Y5ZaT", name: "Research — Papers", category: "public" },
  { id: "khdi9", name: "Essays — Journal", category: "public" },
  { id: "Qz4tR", name: "Membership — Observatory", category: "public" },
  { id: "7Mjs0", name: "About — Biography", category: "public" },
  { id: "jEDyZ", name: "Contact", category: "public" },
  { id: "27mw3", name: "Events — Calendar", category: "public" },
  { id: "wskOX", name: "The Scriptorium — Shop", category: "public" },
  { id: "2acax", name: "Search Results", category: "public" },

  // Detail Pages
  { id: "Flwtv", name: "Poem — Detail", category: "detail" },
  { id: "RqPDQ", name: "Photo — Detail", category: "detail" },
  { id: "Io3k3", name: "Photography — Series Detail", category: "detail" },
  { id: "GlrQ4", name: "Essay — Detail", category: "detail" },
  { id: "Kb7hW", name: "Music — Detail", category: "detail" },
  { id: "UFbIG", name: "Research — Detail", category: "detail" },
  { id: "qE5KQ", name: "Book — Detail", category: "detail" },
  { id: "jpiq0", name: "Event — Detail", category: "detail" },
  { id: "Lm5NB", name: "Shop Product — Detail", category: "detail" },

  // Gated Content
  { id: "gbcrS", name: "Gated Content — Non-Member View", category: "gated" },
  { id: "cG2se", name: "Gated — Photography", category: "gated" },
  { id: "CsSUl", name: "Gated — Essay", category: "gated" },
  { id: "Il5pT", name: "Gated — Music", category: "gated" },
  { id: "ai5OL", name: "Gated — Research", category: "gated" },
  { id: "MXHrs", name: "Gated — Book", category: "gated" },

  // Auth / Account
  { id: "76GVs", name: "Login / Sign Up", category: "auth" },
  { id: "MdM1s", name: "Password Reset", category: "auth" },
  { id: "8JBs1", name: "Email Verification", category: "auth" },
  { id: "e6CJf", name: "Member — Account", category: "auth" },
  { id: "GMRFi", name: "Membership — Payment", category: "auth" },
  { id: "oNwAW", name: "Donation — Thank You", category: "auth" },
  { id: "bnT8n", name: "Patron — Dashboard", category: "auth" },
  { id: "fI3Xe", name: "Checkout — Cart", category: "auth" },

  // Legal / Misc
  { id: "bpEcu", name: "Terms of Service", category: "legal" },
  { id: "LMOUw", name: "Privacy Policy", category: "legal" },
  { id: "ZftJS", name: "Cookie Policy", category: "legal" },
  { id: "AcjTM", name: "404 — Not Found", category: "legal" },
  { id: "BGTiC", name: "Newsletter — Email Template", category: "legal" },

  // Logos
  { id: "eo8Zp", name: "Logo — lemagepoet", category: "logos" },
  { id: "E67Qw", name: "Logo — MGM Handwritten", category: "logos" },
  { id: "4tUAn", name: "Logo — MGM Handwritten (backup)", category: "logos" },

  // Admin
  { id: "5CTRn", name: "Admin — Dashboard", category: "admin" },
  { id: "RIOcn", name: "Admin — Content Management", category: "admin" },
  { id: "g8azp", name: "Admin — Upload / Editor", category: "admin" },
  { id: "VFplr", name: "Admin — Members", category: "admin" },
  { id: "M5GbG", name: "Admin — Analytics", category: "admin" },
  { id: "AeLJO", name: "Admin — Newsletter", category: "admin" },
  { id: "FwLnF", name: "Admin — Newsletter Compose", category: "admin" },
  { id: "ksgxM", name: "Admin — Settings", category: "admin" },
  { id: "M1f5u", name: "Admin — SEO", category: "admin" },
  { id: "0XFrk", name: "Admin — SEO Editor", category: "admin" },
  { id: "tY5kE", name: "Admin — The Scriptorium", category: "admin" },
  { id: "uB8F2", name: "Admin — Partnerships", category: "admin" },
  { id: "8wMi2", name: "Admin — Quotes & Moments", category: "admin" },
  { id: "X2iqE", name: "Admin — Events", category: "admin" },
  { id: "kGIsE", name: "Admin — Orders", category: "admin" },
  { id: "xwz4A", name: "Admin — Media Library", category: "admin" },
];

export default function AdminDesignsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    activeCategory === "all"
      ? screens
      : screens.filter((s) => s.category === activeCategory);

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">
          Design Exports
        </h1>
        <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
          {filtered.length} screens
        </span>
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex gap-1 px-8 py-4 border-b border-border overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "font-sans text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap",
              activeCategory === cat.id
                ? "bg-accent text-bg font-medium"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto">
        {filtered.map((screen) => (
          <button
            key={screen.id}
            onClick={() =>
              setExpanded(expanded === screen.id ? null : screen.id)
            }
            className="bg-bg-card border border-border rounded-lg overflow-hidden text-left hover:border-accent-dim transition-colors group"
          >
            <div className="relative w-full aspect-[16/10] bg-bg-elevated overflow-hidden">
              <Image
                src={`/design-exports/${screen.id}.png`}
                alt={screen.name}
                fill
                className="object-contain object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="font-sans text-sm text-text-primary group-hover:text-accent transition-colors">
                {screen.name}
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {screen.id}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Expanded Overlay ── */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setExpanded(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto rounded-lg border border-border bg-bg-card shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-bg-card border-b border-border">
              <span className="font-sans text-sm font-medium text-text-primary">
                {screens.find((s) => s.id === expanded)?.name}
              </span>
              <button className="font-mono text-xs text-text-muted hover:text-text-primary">
                ESC to close
              </button>
            </div>
            <Image
              src={`/design-exports/${expanded}.png`}
              alt={screens.find((s) => s.id === expanded)?.name ?? ""}
              width={1440}
              height={900}
              className="w-auto max-w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
