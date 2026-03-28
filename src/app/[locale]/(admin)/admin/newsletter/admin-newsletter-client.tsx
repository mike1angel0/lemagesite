"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Trash2, Pencil } from "lucide-react";
import { deleteNewsletterAction } from "@/lib/actions/newsletter";
import type { AuthState } from "@/lib/actions/auth";

const tabs = ["All", "Drafts", "Scheduled", "Sent"];

const statusBadgeColors: Record<string, string> = {
  SENT: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  DRAFT: "bg-gold/10 text-gold",
  SCHEDULED: "bg-accent/10 text-accent",
};

const statusLabels: Record<string, string> = {
  SENT: "Sent",
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
};

interface NewsletterRow {
  id: string;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  openRate: number | null;
  clickRate: number | null;
  createdAt: string;
}

interface Summary {
  subscribers: number;
  drafts: number;
  scheduled: number;
  sent: number;
}

export function AdminNewsletterClient({
  newsletters: initialNewsletters,
  summary,
}: {
  newsletters: NewsletterRow[];
  summary: Summary;
}) {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [activeTab, setActiveTab] = useState("All");
  const [, deleteAction] = useActionState(deleteNewsletterAction, {} as AuthState);

  const filtered = newsletters.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Drafts") return n.status === "DRAFT";
    if (activeTab === "Scheduled") return n.status === "SCHEDULED";
    if (activeTab === "Sent") return n.status === "SENT";
    return true;
  });

  function handleDelete(nl: NewsletterRow) {
    if (!confirm(`Delete "${nl.subject}"?`)) return;
    setNewsletters((prev) => prev.filter((n) => n.id !== nl.id));
    const fd = new FormData();
    fd.set("id", nl.id);
    deleteAction(fd);
  }

  const stats = [
    { label: "SUBSCRIBERS", value: String(summary.subscribers) },
    { label: "DRAFTS", value: String(summary.drafts) },
    { label: "SCHEDULED", value: String(summary.scheduled) },
    { label: "SENT", value: String(summary.sent) },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Newsletter</h1>
        <Link href="/admin/newsletter/compose" className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity">
          Compose Newsletter
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-lg p-5">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">{stat.label}</p>
            <p className="font-serif text-[32px] font-light text-text-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Past Newsletters */}
      <div className="px-8 mt-8">
        <h2 className="font-serif text-lg text-text-primary mb-4">Past Newsletters</h2>

        {/* Filter Tabs */}
        <div className="border-b border-border pb-4 mb-0">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "font-sans text-xs pb-4 transition-colors",
                  tab === activeTab
                    ? "border-b-2 border-accent text-accent font-medium"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Subject</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Status</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Date</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Open Rate</th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-border">
                <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">{row.subject}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full", statusBadgeColors[row.status])}>
                    {statusLabels[row.status]}
                  </span>
                </td>
                <td className="font-mono text-[10px] text-text-muted px-4 py-3.5">
                  {row.sentAt ? new Date(row.sentAt).toLocaleDateString() : row.scheduledAt ? new Date(row.scheduledAt).toLocaleDateString() : "—"}
                </td>
                <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                  {row.openRate != null ? `${row.openRate}%` : "—"}
                </td>
                <td className="px-4 py-3.5 flex items-center gap-3">
                  <Link href={`/admin/newsletter/${row.id}`} className="inline-flex items-center gap-1 font-sans text-xs text-accent hover:text-text-primary transition-colors">
                    <Pencil size={12} />Edit
                  </Link>
                  <button onClick={() => handleDelete(row)} className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-red-400 transition-colors">
                    <Trash2 size={12} />Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center font-sans text-sm text-text-muted py-8">No newsletters found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
