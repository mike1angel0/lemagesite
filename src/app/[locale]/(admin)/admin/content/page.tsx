"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["All", "Poems", "Photos", "Essays", "Music", "Books", "Research"];

const tabToType: Record<string, string> = {
  Poems: "Poem",
  Photos: "Photo",
  Essays: "Essay",
  Music: "Music",
  Books: "Book",
  Research: "Research",
};

type ContentRow = {
  title: string;
  type: string;
  status: string;
  access: string;
  date: string;
};

const typeBadgeColors: Record<string, string> = {
  Poem: "bg-[#182240] text-starlight",
  Photo: "bg-[#1A1A2E] text-accent",
  Essay: "bg-[#1E1A0D] text-gold",
  Music: "bg-[#1A0D1E] text-honey",
  Book: "bg-[#0D1A1E] text-warm-ivory",
  Research: "bg-[#0D1E1A] text-accent",
};

const statusBadgeColors: Record<string, string> = {
  Published: "bg-[#0D2818] text-[#6BBF7B]",
  Draft: "bg-[#2A1A0D] text-gold",
};

const initialContentRows: ContentRow[] = [
  {
    title: "Cartography of Silence",
    type: "Poem",
    status: "Published",
    access: "Members",
    date: "Feb 28, 2026",
  },
  {
    title: "Winter Light Series \u2014 Bucharest",
    type: "Photo",
    status: "Published",
    access: "Public",
    date: "Feb 25, 2026",
  },
  {
    title: "On the Architecture of Memory",
    type: "Essay",
    status: "Draft",
    access: "Patrons",
    date: "Feb 22, 2026",
  },
  {
    title: "Nocturne in Blue Minor",
    type: "Music",
    status: "Published",
    access: "Supporters+",
    date: "Feb 18, 2026",
  },
  {
    title: "The Weight of Light \u2014 Collected Poems",
    type: "Book",
    status: "Published",
    access: "Public",
    date: "Jan 15, 2026",
  },
  {
    title: "Quantum Poetics: Language & Physics",
    type: "Research",
    status: "Draft",
    access: "Inner Circle",
    date: "Feb 20, 2026",
  },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<ContentRow[]>(initialContentRows);

  const filtered = rows.filter((row) => {
    const matchesTab =
      activeTab === "All" || row.type === tabToType[activeTab];
    const matchesSearch =
      !searchQuery ||
      row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function handleDelete(index: number) {
    const targetRow = filtered[index];
    setRows(rows.filter((r) => r !== targetRow));
  }

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-5 px-0 border-b border-border mx-8">
        <h1 className="font-sans text-[20px] font-semibold text-text-primary">
          Content Management
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-card border border-border rounded-md px-3.5 py-2">
            <Search size={14} className="text-text-muted" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-40"
            />
          </div>
          <button
            onClick={() => alert("Filter coming soon")}
            className="flex items-center gap-2 bg-bg-card border border-border rounded-md px-3.5 py-2"
          >
            <SlidersHorizontal size={14} className="text-text-muted" />
            <span className="font-sans text-sm text-text-muted">Filter</span>
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="border-b border-border mx-8">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "font-sans text-sm py-3 transition-colors",
                tab === activeTab
                  ? "border-b-2 border-accent text-text-primary font-medium"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Table ── */}
      <div className="mx-8">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Title
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Type
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Status
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Access
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Date
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr key={`${row.title}-${index}`} className="border-b border-border">
                <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                  {row.title}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[1px] rounded-sm px-2 py-0.5",
                      typeBadgeColors[row.type],
                    )}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[1px] rounded-sm px-2 py-0.5",
                      statusBadgeColors[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="font-sans text-[12px] text-text-secondary px-4 py-3.5">
                  {row.access}
                </td>
                <td className="font-mono text-[11px] text-text-muted px-4 py-3.5">
                  {row.date}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/admin/editor/1"
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-accent transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(index)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-accent transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className="flex justify-between items-center py-4">
          <span className="font-sans text-sm text-text-muted">
            Showing 1&ndash;{filtered.length} of {filtered.length} items
          </span>
        </div>
      </div>
    </>
  );
}
