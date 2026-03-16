"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Search, Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteContentAction } from "@/lib/actions/content";
import type { AuthState } from "@/lib/actions/auth";

const tabs = ["All", "Poems", "Photos", "Essays", "Research"];

const tabToType: Record<string, string> = {
  Poems: "Poem",
  Photos: "Photo",
  Essays: "Essay",
  Research: "Research",
};

interface ContentRow {
  id: string;
  title: string;
  type: "Poem" | "Photo" | "Essay" | "Research";
  status: string;
  access: string;
  date: string;
}

const typeBadgeColors: Record<string, string> = {
  Poem: "bg-[#182240] text-starlight",
  Photo: "bg-[#1A1A2E] text-accent",
  Essay: "bg-[#1E1A0D] text-gold",
  Research: "bg-[#0D1E1A] text-accent",
};

const statusBadgeColors: Record<string, string> = {
  Published: "bg-[#0D2818] text-[#6BBF7B]",
  Draft: "bg-[#2A1A0D] text-gold",
};

const tierLabels: Record<string, string> = {
  FREE: "Public",
  SUPPORTER: "Supporter",
  PATRON: "Patron",
  INNER_CIRCLE: "Inner Circle",
};

export function AdminContentClient({ rows: initialRows }: { rows: ContentRow[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState(initialRows);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteContentAction, {} as AuthState);

  const filtered = rows.filter((row) => {
    const matchesTab =
      activeTab === "All" || row.type === tabToType[activeTab];
    const matchesSearch =
      !searchQuery ||
      row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function handleDelete(row: ContentRow) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));

    const formData = new FormData();
    formData.set("id", row.id);
    formData.set("type", row.type);
    deleteAction(formData);
  }

  return (
    <>
      {/* Top Bar */}
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
          <Link
            href={`/admin/editor${activeTab !== "All" ? `?type=${tabToType[activeTab]}` : ""}`}
            className="inline-flex items-center gap-1.5 bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            {activeTab === "All"
              ? "New Content"
              : `New ${tabToType[activeTab]}`}
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
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
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table */}
      <div className="mx-8">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Title</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Type</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Status</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Access</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Date</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={`${row.type}-${row.id}`} className="border-b border-border">
                <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                  <Link href={`/admin/editor/${row.id}`} className="hover:text-accent transition-colors">
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn("font-mono text-[10px] tracking-[1px] rounded-sm px-2 py-0.5", typeBadgeColors[row.type])}>
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn("font-mono text-[10px] tracking-[1px] rounded-sm px-2 py-0.5", statusBadgeColors[row.status])}>
                    {row.status}
                  </span>
                </td>
                <td className="font-sans text-[12px] text-text-secondary px-4 py-3.5">
                  {tierLabels[row.access] || row.access}
                </td>
                <td className="font-mono text-[11px] text-text-muted px-4 py-3.5">
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/editor/${row.id}`}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-accent transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(row)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center font-sans text-sm text-text-muted py-8">
                  No content found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center py-4">
          <span className="font-sans text-sm text-text-muted">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </>
  );
}
