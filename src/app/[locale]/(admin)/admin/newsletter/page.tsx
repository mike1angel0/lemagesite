"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const stats = [
  { label: "SUBSCRIBERS", value: "2,341", change: "+29% y/y", positive: true },
  { label: "OPEN RATE", value: "64.2%", change: "+3% vs avg", positive: true },
  { label: "CLICK RATE", value: "18.7%", change: "+2.1% vs avg", positive: true },
  { label: "SENT THIS MONTH", value: "24", change: "6 pending", positive: false },
];

const tabs = ["All", "Drafts", "Scheduled", "Sent"];
const activeTab = "All";

const statusBadgeColors: Record<string, string> = {
  Sent: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  Draft: "bg-gold/10 text-gold",
  Scheduled: "bg-accent/10 text-accent",
};

const newsletters = [
  {
    subject: "The Cartography of Silence — March Edition",
    status: "Sent",
    date: "Mar 10, 2026",
    openRate: "68.4%",
    clicks: "342",
  },
  {
    subject: "New Photography Series: Fog Studies",
    status: "Sent",
    date: "Mar 5, 2026",
    openRate: "61.2%",
    clicks: "287",
  },
  {
    subject: "Spring Equinox — Poetry & Rituals",
    status: "Scheduled",
    date: "Mar 20, 2026",
    openRate: "—",
    clicks: "—",
  },
  {
    subject: "Observatory Tea Collection Launch",
    status: "Draft",
    date: "—",
    openRate: "—",
    clicks: "—",
  },
  {
    subject: "February Retrospective: On Longing",
    status: "Sent",
    date: "Feb 28, 2026",
    openRate: "72.1%",
    clicks: "419",
  },
  {
    subject: "Inner Circle — Exclusive Research Notes",
    status: "Sent",
    date: "Feb 20, 2026",
    openRate: "58.9%",
    clicks: "156",
  },
];

export default function AdminNewsletterPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Newsletter</h1>
        <Link
          href="/admin/newsletter/compose"
          className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Compose Newsletter
        </Link>
      </div>

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
            <p
              className={cn(
                "font-sans text-[11px] mt-1",
                stat.positive ? "text-[#6BBF7B]" : "text-text-secondary",
              )}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* ── Past Newsletters ── */}
      <div className="px-8 mt-8">
        <h2 className="font-serif text-lg text-text-primary mb-4">
          Past Newsletters
        </h2>

        {/* Filter Tabs */}
        <div className="border-b border-border pb-4 mb-0">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <span
                key={tab}
                onClick={() => alert(`${tab} filter coming soon`)}
                className={cn(
                  "font-sans text-xs cursor-pointer pb-4 transition-colors",
                  tab === activeTab
                    ? "border-b-2 border-accent text-accent font-medium"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Subject
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Status
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Sent Date
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Open Rate
              </th>
              <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                Clicks
              </th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((row) => (
              <tr key={row.subject} className="border-b border-border">
                <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                  {row.subject}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                      statusBadgeColors[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="font-mono text-[10px] text-text-muted px-4 py-3.5">
                  {row.date}
                </td>
                <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                  {row.openRate}
                </td>
                <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                  {row.clicks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
