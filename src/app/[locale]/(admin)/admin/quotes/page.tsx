"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type Quote = {
  text: string;
  source: string;
  pages: string[];
  active: boolean;
};

const initialQuotes: Quote[] = [
  {
    text: "We carry in us the gardens we have known.",
    source: "Rainer Maria Rilke",
    pages: ["Home", "Poetry"],
    active: true,
  },
  {
    text: "The only journey is the one within.",
    source: "Rainer Maria Rilke",
    pages: ["Login"],
    active: true,
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    source: "Albert Einstein",
    pages: ["Home"],
    active: true,
  },
  {
    text: "One must still have chaos in oneself to give birth to a dancing star.",
    source: "Friedrich Nietzsche",
    pages: ["Poetry"],
    active: false,
  },
  {
    text: "The wound is the place where the Light enters you.",
    source: "Rumi",
    pages: ["Home", "Login"],
    active: true,
  },
  {
    text: "Not all those who wander are lost.",
    source: "J.R.R. Tolkien",
    pages: ["Photography"],
    active: false,
  },
];

const pageOptions = ["Home", "Login", "Poetry", "Photography", "Music", "Research", "Essays", "About"];

const movementSettings = [
  { label: "Login Page", enabled: true },
  { label: "Home Page", enabled: true },
  { label: "Poetry Collection", enabled: true },
  { label: "Random-shuffle", enabled: false },
];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newPages, setNewPages] = useState<string[]>([]);

  const activeCount = quotes.filter((q) => q.active).length;

  function handleAddQuote() {
    if (!newText.trim() || !newSource.trim()) return;
    setQuotes([
      ...quotes,
      { text: newText.trim(), source: newSource.trim(), pages: newPages, active: true },
    ]);
    setNewText("");
    setNewSource("");
    setNewPages([]);
    setShowForm(false);
  }

  function toggleQuote(index: number) {
    setQuotes(quotes.map((q, i) => (i === index ? { ...q, active: !q.active } : q)));
  }

  function togglePage(page: string) {
    setNewPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page],
    );
  }

  const stats = [
    { label: "TOTAL QUOTES", value: String(quotes.length) },
    { label: "ACTIVE PLACEMENTS", value: String(activeCount) },
    { label: "PHOTOS IN MOOD", value: "18" },
  ];

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">
            Quotes &amp; Moments
          </h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">
            Curate quotes, moods, and ambient visuals across the site
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Add Quote
        </button>
      </div>

      {/* ── Add Quote Form ── */}
      {showForm && (
        <div className="mx-8 mt-6 bg-bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-text-primary">New Quote</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Quote Text
              </label>
              <textarea
                placeholder="Enter the quote..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-serif text-sm italic focus:outline-none focus:border-accent-dim placeholder:text-text-muted resize-y min-h-[80px]"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Source / Author
              </label>
              <input
                type="text"
                placeholder="e.g. Rainer Maria Rilke"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Display on Pages
              </label>
              <div className="flex flex-wrap gap-2">
                {pageOptions.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => togglePage(page)}
                    className={cn(
                      "font-mono text-[10px] tracking-[1px] px-3 py-1 rounded transition-colors",
                      newPages.includes(page)
                        ? "bg-accent text-text-on-accent"
                        : "bg-bg-elevated text-text-muted hover:text-text-primary",
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setShowForm(false)}
                className="border border-border rounded-md px-4 py-2 font-sans text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuote}
                disabled={!newText.trim() || !newSource.trim()}
                className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Save Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-card border border-border rounded-lg p-5"
          >
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              {stat.label}
            </p>
            <p className="font-serif text-[32px] font-light text-text-primary mt-1">
              {stat.value}
            </p>
          </div>
        ))}

        {/* Featured Quote Preview Card */}
        <div className="bg-bg-card border border-border rounded-lg p-5 flex flex-col justify-between">
          <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
            FEATURED
          </p>
          <p className="font-serif text-base italic text-text-primary mt-2 leading-relaxed">
            &ldquo;{quotes[0]?.text}&rdquo;
          </p>
          <p className="font-sans text-[11px] text-text-muted mt-1">
            &mdash; {quotes[0]?.source}
          </p>
        </div>
      </div>

      {/* ── Quotes Table + Sidebar ── */}
      <div className="flex gap-6 px-8 mt-8">
        {/* Quotes Table */}
        <div className="flex-1 min-w-0">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Quote
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Source
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Pages
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((row, index) => (
                <tr key={`${row.text}-${index}`} className="border-b border-border">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5 max-w-[320px]">
                    <span className="line-clamp-2 italic">{row.text}</span>
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5 whitespace-nowrap">
                    {row.source}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {row.pages.map((page) => (
                        <span
                          key={page}
                          className="font-mono text-[10px] tracking-[1px] px-2 py-0.5 rounded bg-bg-elevated text-text-muted"
                        >
                          {page}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleQuote(index)}
                      className={cn(
                        "w-9 h-5 rounded-full relative transition-colors",
                        row.active ? "bg-[#6BBF7B]" : "bg-bg-elevated",
                      )}
                    >
                      <div
                        className={cn(
                          "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all",
                          row.active ? "right-[3px]" : "left-[3px]",
                        )}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Sidebar */}
        <div className="w-[340px] shrink-0 space-y-6">
          {/* Photo Library */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">
              Photo Library
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => alert("Open photo coming soon")}
                  className="bg-bg-elevated rounded h-20 cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>

          {/* Movement Settings */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">
              Movement Settings
            </h3>
            <div className="space-y-3">
              {movementSettings.map((setting) => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between"
                >
                  <span className="font-sans text-[13px] text-text-primary">
                    {setting.label}
                  </span>
                  <div
                    onClick={() => alert("Toggle setting coming soon")}
                    className={cn(
                      "w-9 h-5 rounded-full relative cursor-pointer transition-colors",
                      setting.enabled ? "bg-[#6BBF7B]" : "bg-bg-elevated",
                    )}
                  >
                    <div
                      className={cn(
                        "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all",
                        setting.enabled ? "right-[3px]" : "left-[3px]",
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rotation Settings */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">
              Rotation Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Frequency
                </label>
                <div
                  onClick={() => alert("Frequency selector coming soon")}
                  className="bg-bg-elevated border border-border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-sans text-sm text-text-primary">
                    Every AM
                  </span>
                  <span className="font-sans text-xs text-text-muted">
                    &darr;
                  </span>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Quote Priority
                </label>
                <div
                  onClick={() => alert("Quote priority selector coming soon")}
                  className="bg-bg-elevated border border-border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-sans text-sm text-text-primary">
                    Random
                  </span>
                  <span className="font-sans text-xs text-text-muted">
                    &darr;
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-text-primary">
                  Auto-Rotate
                </span>
                <div
                  onClick={() => alert("Toggle auto-rotate coming soon")}
                  className="w-9 h-5 rounded-full relative cursor-pointer transition-colors bg-[#6BBF7B]"
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] right-[3px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
