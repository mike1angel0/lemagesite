"use client";

import { Download, BarChart3, ArrowRight } from "lucide-react";
import type { AnalyticsData } from "@/lib/actions/analytics";

export function AdminAnalyticsClient({ data }: { data: AnalyticsData }) {
  const { contentCounts, memberStats, orderStats, newsletterStats } = data;

  const stats = [
    { label: "TOTAL CONTENT", value: String(contentCounts.total) },
    { label: "MEMBERS", value: String(memberStats.total) },
    { label: "ACTIVE", value: String(memberStats.active) },
    { label: "NEWSLETTER SUBS", value: String(memberStats.newsletterSubscribers) },
    { label: "REVENUE", value: `€${orderStats.totalRevenue.toFixed(0)}` },
  ];

  const contentBreakdown = [
    { label: "Poetry", count: contentCounts.poems, pct: contentCounts.total > 0 ? Math.round((contentCounts.poems / contentCounts.total) * 100) : 0 },
    { label: "Photography", count: contentCounts.photos, pct: contentCounts.total > 0 ? Math.round((contentCounts.photos / contentCounts.total) * 100) : 0 },
    { label: "Essays", count: contentCounts.essays, pct: contentCounts.total > 0 ? Math.round((contentCounts.essays / contentCounts.total) * 100) : 0 },
    { label: "Research", count: contentCounts.research, pct: contentCounts.total > 0 ? Math.round((contentCounts.research / contentCounts.total) * 100) : 0 },
    { label: "Books", count: contentCounts.books, pct: contentCounts.total > 0 ? Math.round((contentCounts.books / contentCounts.total) * 100) : 0 },
    { label: "Albums", count: contentCounts.albums, pct: contentCounts.total > 0 ? Math.round((contentCounts.albums / contentCounts.total) * 100) : 0 },
  ];

  const memberBreakdown = [
    { name: "Free", count: memberStats.free, color: "bg-text-muted" },
    { name: "Supporter", count: memberStats.supporters, color: "bg-starlight" },
    { name: "Patron", count: memberStats.patrons, color: "bg-gold" },
    { name: "Inner Circle", count: memberStats.innerCircle, color: "bg-accent" },
  ];

  const funnelSteps = [
    { label: "Total Members", value: String(memberStats.total), pct: 100 },
    { label: "Active", value: String(memberStats.active), pct: memberStats.total > 0 ? Math.round((memberStats.active / memberStats.total) * 100) : 0 },
    { label: "Newsletter Subs", value: String(memberStats.newsletterSubscribers), pct: memberStats.total > 0 ? Math.round((memberStats.newsletterSubscribers / memberStats.total) * 100) : 0 },
    { label: "Paying", value: String(memberStats.supporters + memberStats.patrons + memberStats.innerCircle), pct: memberStats.total > 0 ? Math.round(((memberStats.supporters + memberStats.patrons + memberStats.innerCircle) / memberStats.total) * 100) : 0 },
  ];

  function handleExport() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">Analytics</h1>
        <button onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors">
          <Download className="h-3.5 w-3.5" />
          Export JSON
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4 px-8 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-5">
            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">{s.label}</p>
            <p className="font-serif text-[32px] font-light leading-none text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Newsletter Performance */}
      <div className="px-8 mt-6">
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">Newsletter</h2>
          <div className="flex items-center gap-8">
            {[
              { label: "TOTAL", value: String(newsletterStats.total) },
              { label: "SENT", value: String(newsletterStats.sent) },
              { label: "DRAFTS", value: String(newsletterStats.drafts) },
              { label: "SCHEDULED", value: String(newsletterStats.scheduled) },
            ].map((ns) => (
              <div key={ns.label} className="flex flex-col gap-1">
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">{ns.label}</p>
                <p className="font-serif text-[24px] font-light leading-none text-text-primary">{ns.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Performance + Orders */}
      <div className="grid grid-cols-2 gap-4 px-8 mt-6">
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">Member Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">TOTAL REVENUE</p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">€{orderStats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">PAID ORDERS</p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">{orderStats.paidOrders}</p>
            </div>
          </div>
          <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase mb-3">TIER BREAKDOWN</p>
          <div className="flex flex-col gap-2.5">
            {memberBreakdown.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-[12px] text-text-secondary">{t.name}</span>
                  <span className="font-sans text-[12px] text-text-primary">{t.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border">
                  <div className={`h-1.5 rounded-full ${t.color}`} style={{ width: `${memberStats.total > 0 ? (t.count / memberStats.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">Orders</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">TOTAL ORDERS</p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">{orderStats.totalOrders}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">PAID</p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">{orderStats.paidOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Views by Content Type + Visitor Funnel */}
      <div className="grid grid-cols-2 gap-4 px-8 mt-6 pb-8">
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[14px] font-medium text-text-primary">Content Breakdown</h2>
            <BarChart3 className="h-4 w-4 text-text-muted" />
          </div>
          <div className="flex flex-col gap-3">
            {contentBreakdown.map((ct) => (
              <div key={ct.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-[12px] text-text-secondary">{ct.label}</span>
                  <span className="font-mono text-[10px] text-text-muted">{ct.count} ({ct.pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${ct.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">Member Funnel</h2>
          <div className="flex flex-col gap-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="h-3 w-3 text-text-muted" />}
                    <span className="font-sans text-[13px] text-text-primary">{step.label}</span>
                  </div>
                  <span className="font-serif text-[20px] font-light text-text-primary">{step.value}</span>
                </div>
                <div className="h-3 w-full rounded bg-border">
                  <div className="h-3 rounded bg-accent-dim" style={{ width: `${step.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
