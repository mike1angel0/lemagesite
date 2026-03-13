"use client";

import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const summaryCards = [
  { label: "TOTAL", value: "1,247" },
  { label: "ACTIVE", value: "847" },
  { label: "SUPPORTERS", value: "234" },
  { label: "PATRONS", value: "142" },
  { label: "INNER CIRCLE", value: "24" },
];

const tierBadgeColors: Record<string, string> = {
  Free: "bg-text-muted/10 text-text-muted",
  Supporter: "bg-starlight/10 text-starlight",
  Patron: "bg-gold/10 text-gold",
  "Inner Circle": "bg-accent/10 text-accent",
};

const statusColors: Record<string, string> = {
  Active: "text-[#6BBF7B]",
  Inactive: "text-text-muted",
};

const columns = ["NAME", "EMAIL", "TIER", "STATUS", "JOINED", "REVENUE"];

const memberRows = [
  {
    name: "Elena Vasilescu",
    email: "elena@example.com",
    tier: "Patron",
    status: "Active",
    joined: "Jan 12, 2026",
    revenue: "\u20AC54",
  },
  {
    name: "Andrei Marinescu",
    email: "andrei@example.com",
    tier: "Inner Circle",
    status: "Active",
    joined: "Dec 3, 2025",
    revenue: "\u20AC240",
  },
  {
    name: "Clara Dumitrescu",
    email: "clara@example.com",
    tier: "Supporter",
    status: "Active",
    joined: "Feb 20, 2026",
    revenue: "\u20AC18",
  },
  {
    name: "Radu Popescu",
    email: "radu@example.com",
    tier: "Free",
    status: "Inactive",
    joined: "Nov 15, 2025",
    revenue: "\u20AC0",
  },
  {
    name: "Ioana Stanescu",
    email: "ioana@example.com",
    tier: "Patron",
    status: "Active",
    joined: "Mar 1, 2026",
    revenue: "\u20AC36",
  },
  {
    name: "Mihai Georgescu",
    email: "mihai@example.com",
    tier: "Supporter",
    status: "Active",
    joined: "Jan 28, 2026",
    revenue: "\u20AC12",
  },
  {
    name: "Sofia Albescu",
    email: "sofia@example.com",
    tier: "Free",
    status: "Inactive",
    joined: "Oct 5, 2025",
    revenue: "\u20AC0",
  },
];

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminMembersPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Members
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-sans text-[12px] text-text-muted">
              Search members...
            </span>
          </div>
          <button onClick={() => alert("Add member coming soon")} className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg">
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-5 gap-4 px-8 mt-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-5"
          >
            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
              {card.label}
            </p>
            <p className="font-serif text-[32px] font-light leading-none text-text-primary">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Table Header ── */}
      <div className="px-8 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[14px] font-medium text-text-primary">
            All Members
          </h2>
          <button onClick={() => alert("Export coming soon")} className="font-sans text-[12px] text-accent-dim hover:text-accent transition-colors">
            Export CSV
          </button>
        </div>

        {/* ── Members Table ── */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberRows.map((row) => (
                <tr key={row.email} className="border-b border-border last:border-b-0">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.name}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                        tierBadgeColors[row.tier],
                      )}
                    >
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-sans text-[13px]",
                        statusColors[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="font-sans text-[13px] text-text-muted px-4 py-3.5">
                    {row.joined}
                  </td>
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
