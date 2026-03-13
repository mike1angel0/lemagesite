"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const stats = [
  { label: "ACTIVE PARTNERS", value: "5" },
  { label: "MONTHLY REVENUE", value: "\u20AC420/mo" },
  { label: "TOTAL CLICKS", value: "1,047" },
  { label: "CONVERSION RATE", value: "2.8%" },
];

const partnerTabs = ["All", "Active", "Pending", "Paused"];
const activeTab = "All";

const statusBadgeColors: Record<string, string> = {
  Active: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  Paused: "bg-gold/10 text-gold",
  Pending: "bg-accent/10 text-accent",
};

const partners = [
  {
    name: "Moleskine",
    type: "Affiliate",
    status: "Active",
    clicks: "412",
    revenue: "\u20AC180",
  },
  {
    name: "Leuchtturm1917",
    type: "Affiliate",
    status: "Active",
    clicks: "287",
    revenue: "\u20AC120",
  },
  {
    name: "Romanian Cultural Institute",
    type: "Sponsorship",
    status: "Active",
    clicks: "198",
    revenue: "\u20AC75",
  },
  {
    name: "Letterfolk",
    type: "Affiliate",
    status: "Paused",
    clicks: "96",
    revenue: "\u20AC30",
  },
  {
    name: "Poetry Foundation",
    type: "Collaboration",
    status: "Pending",
    clicks: "54",
    revenue: "\u20AC15",
  },
];

const placementRules = [
  { label: "Site-wide ads", enabled: true },
  { label: "Photo of embed quotes", enabled: true },
  { label: "Auto-rotate banners", enabled: false },
  { label: "Custom tracking params", enabled: true },
];

const revenueByPartner = [
  { name: "Moleskine", amount: "\u20AC180", color: "bg-[#6BBF7B]" },
  { name: "Leuchtturm1917", amount: "\u20AC120", color: "bg-accent" },
  { name: "Romanian Cultural Institute", amount: "\u20AC75", color: "bg-gold" },
  { name: "Letterfolk", amount: "\u20AC30", color: "bg-starlight" },
  { name: "Poetry Foundation", amount: "\u20AC15", color: "bg-honey" },
];

export default function AdminPartnershipsPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">
            Partnerships
          </h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">
            Manage curated partnerships, collaborations &amp; affiliate links
          </p>
        </div>
        <Link href="/admin/partnerships/new" className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity">
          Add Partner
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
          </div>
        ))}
      </div>

      {/* ── Partners Table + Sidebar ── */}
      <div className="flex gap-6 px-8 mt-8">
        {/* All Partners Table */}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-lg text-text-primary mb-4">
            All Partners
          </h2>

          {/* Tabs */}
          <div className="border-b border-border pb-4 mb-0">
            <div className="flex items-center gap-6">
              {partnerTabs.map((tab) => (
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

          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Partner
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Type
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Status
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Clicks
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {partners.map((row) => (
                <tr key={row.name} className="border-b border-border">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.name}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.type}
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
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.clicks}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Sidebar */}
        <div className="w-[300px] shrink-0 space-y-6">
          {/* Placement Rules */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">
              Placement Rules
            </h3>
            <div className="space-y-3">
              {placementRules.map((rule) => (
                <div
                  key={rule.label}
                  className="flex items-center justify-between"
                >
                  <span className="font-sans text-[13px] text-text-primary">
                    {rule.label}
                  </span>
                  <div
                    onClick={() => alert("Toggle placement rule coming soon")}
                    className={cn(
                      "w-9 h-5 rounded-full relative cursor-pointer transition-colors",
                      rule.enabled ? "bg-[#6BBF7B]" : "bg-bg-elevated",
                    )}
                  >
                    <div
                      className={cn(
                        "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all",
                        rule.enabled ? "right-[3px]" : "left-[3px]",
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Partner */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">
              Revenue by Partner
            </h3>
            <div className="space-y-3">
              {revenueByPartner.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn("w-2.5 h-2.5 rounded-full shrink-0", item.color)}
                    />
                    <span className="font-sans text-[13px] text-text-primary truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-sans text-[13px] text-text-secondary shrink-0 ml-2">
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>

            {/* Monthly Total */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                Monthly Total
              </span>
              <span className="font-serif text-lg text-text-primary">
                &euro;420
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
