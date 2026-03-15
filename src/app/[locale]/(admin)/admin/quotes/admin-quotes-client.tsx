"use client";

import { useState, useActionState } from "react";
import { X, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { createQuoteAction, deleteQuoteAction } from "@/lib/actions/quotes";
import type { AuthState } from "@/lib/actions/auth";

interface QuoteRow {
  id: string;
  text: string;
  attribution: string;
  location: string;
  createdAt: string;
}

export function AdminQuotesClient({ quotes: initialQuotes }: { quotes: QuoteRow[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createState, createAction, createPending] = useActionState(createQuoteAction, {} as AuthState);
  const [, deleteAction] = useActionState(deleteQuoteAction, {} as AuthState);

  const filtered = quotes.filter(
    (q) =>
      !searchQuery ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.attribution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleDelete(quote: QuoteRow) {
    if (!confirm(`Delete this quote?`)) return;
    setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
    const fd = new FormData();
    fd.set("id", quote.id);
    deleteAction(fd);
  }

  const stats = [
    { label: "TOTAL QUOTES", value: String(quotes.length) },
    { label: "THIS MONTH", value: String(quotes.filter((q) => new Date(q.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length) },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">Quotes</h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">Curate quotes displayed across the site</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input type="text" placeholder="Search quotes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent font-sans text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none w-40" />
          </div>
          <button onClick={() => setShowForm(true)} className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity">Add Quote</button>
        </div>
      </div>

      {/* Add Quote Form */}
      {showForm && (
        <div className="mx-8 mt-6 bg-bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-text-primary">New Quote</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary transition-colors"><X size={18} /></button>
          </div>

          {createState.error && <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{createState.error}</p>}
          {createState.success && <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">Quote added. Refresh to see it.</p>}

          <form action={createAction}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Quote Text</label>
                <textarea name="text" placeholder="Enter the quote..." className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-serif text-sm italic focus:outline-none focus:border-accent-dim placeholder:text-text-muted resize-y min-h-[80px]" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Source / Author</label>
                <input name="attribution" type="text" placeholder="e.g. Rainer Maria Rilke" className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Location / Context</label>
                <input name="location" type="text" placeholder="e.g. Letters to a Young Poet" className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="border border-border rounded-md px-4 py-2 font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                <button type="submit" disabled={createPending} className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {createPending ? "Saving..." : "Save Quote"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-8 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-lg p-5">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">{stat.label}</p>
            <p className="font-serif text-[32px] font-light text-text-primary mt-1">{stat.value}</p>
          </div>
        ))}
        {quotes[0] && (
          <div className="bg-bg-card border border-border rounded-lg p-5 flex flex-col justify-between">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">FEATURED</p>
            <p className="font-serif text-base italic text-text-primary mt-2 leading-relaxed">&ldquo;{quotes[0].text}&rdquo;</p>
            <p className="font-sans text-[11px] text-text-muted mt-1">&mdash; {quotes[0].attribution}</p>
          </div>
        )}
      </div>

      {/* Quotes Table */}
      <div className="px-8 mt-8 pb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Quote</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Source</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Date</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-border">
                <td className="font-sans text-[13px] text-text-primary px-4 py-3.5 max-w-[400px]">
                  <span className="line-clamp-2 italic">{row.text}</span>
                </td>
                <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5 whitespace-nowrap">{row.attribution}</td>
                <td className="font-mono text-[11px] text-text-muted px-4 py-3.5">{new Date(row.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => handleDelete(row)} className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-red-400 transition-colors">
                    <Trash2 size={12} />Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center font-sans text-sm text-text-muted py-8">No quotes found.</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <span className="font-sans text-[12px] text-text-muted">{filtered.length} quote{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </>
  );
}
