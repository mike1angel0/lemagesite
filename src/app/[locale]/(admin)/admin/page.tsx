import Link from "next/link";
import { Plus } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const stats = [
  {
    label: "TOTAL MEMBERS",
    value: "1,247",
    change: "+12% this month",
    changeColor: "text-[#6BBF7B]",
  },
  {
    label: "TOTAL REVENUE",
    value: "\u20AC6,788",
    change: "Subs \u20AC3,842 \u00B7 Shop \u20AC2,341 \u00B7 Partners \u20AC420 \u00B7 Tips \u20AC185",
    changeColor: "text-[#6BBF7B]",
  },
  {
    label: "CONTENT PIECES",
    value: "156",
    change: "42 poems \u00B7 24 photos \u00B7 18 essays",
    changeColor: "text-text-secondary",
  },
  {
    label: "PAGE VIEWS",
    value: "28.4K",
    change: "+23% this month",
    changeColor: "text-[#6BBF7B]",
  },
];

const revenueRows = [
  { label: "Membership Subscriptions", amount: "\u20AC3,842", badge: "64.5%" },
  { label: "Shop Sales", amount: "\u20AC2,341" },
  { label: "Partnership Revenue", amount: "\u20AC420" },
  { label: "Tips & Support", amount: "\u20AC185" },
];

const fixedCosts = [
  { label: "Hosting / Domain", amount: "\u20AC25" },
  { label: "Domain & DNS", amount: "\u20AC8" },
  { label: "Payment Processing", amount: "\u20AC115" },
  { label: "Effort & Attribution", amount: "\u20AC2,340" },
  { label: "CDN & Storage", amount: "\u20AC45" },
];

const activities = [
  {
    dot: "bg-[#6BBF7B]",
    description:
      "New patron signup: Elena V. \u2014 \u2018The Cartography of Silence\u2019",
    time: "2 min ago",
  },
  {
    dot: "bg-accent",
    description:
      "New lifetime subscriber: Andrei M. from Bucharest",
    time: "18 min ago",
  },
  {
    dot: "bg-gold",
    description: "Product / deliverable: PDF sent to buyer",
    time: "1 hour ago",
  },
  {
    dot: "bg-text-muted",
    description: "Monthly report ready: Feb 28, 2026",
    time: "3 hours ago",
  },
  {
    dot: "bg-accent-dim",
    description: "5 new signups via LJ: Patreon & Substack",
    time: "yesterday",
  },
];

const tiers = [
  { name: "Free", count: 824, color: "bg-text-muted", width: "w-[67%]" },
  { name: "Supporter", count: 234, color: "bg-accent-dim", width: "w-[19%]" },
  { name: "Patron", count: 142, color: "bg-accent", width: "w-[12%]" },
  { name: "Inner Circle", count: 24, color: "bg-gold", width: "w-[2%]" },
];

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  return (
    <>
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/editor"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[11px] font-medium text-bg"
          >
            <Plus className="h-3.5 w-3.5" />
            New Content
          </Link>
          <div className="h-8 w-8 rounded-full bg-bg-elevated" />
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 px-8 mt-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-5"
          >
            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
              {s.label}
            </p>
            <p className="font-serif text-[32px] font-light leading-none text-text-primary">
              {s.value}
            </p>
            <p className={`font-sans text-[11px] ${s.changeColor}`}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* ── Revenue + Budget (two-col) ─────────────────────────────── */}
      <div className="flex gap-4 px-8 mt-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Revenue Breakdown */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <h2 className="font-sans text-[14px] font-medium text-text-primary">
              Revenue Breakdown
            </h2>
            <div className="my-3 h-px bg-border" />
            <div className="flex flex-col">
              {revenueRows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-sans text-[13px] text-text-primary">
                    {r.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {r.badge && (
                      <span className="rounded bg-[#6BBF7B]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#6BBF7B]">
                        {r.badge}
                      </span>
                    )}
                    <span className="font-sans text-[13px] text-text-primary">
                      {r.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex items-center justify-between py-2">
              <span className="font-sans text-[13px] font-semibold text-text-primary">
                Total Revenue
              </span>
              <span className="font-sans text-[13px] font-semibold text-text-primary">
                {"\u20AC6,788"}
              </span>
            </div>
          </div>

          {/* Budget & Profit */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-[14px] font-medium text-text-primary">
                Budget & Profit
              </h2>
              <span className="rounded bg-[#6BBF7B]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#6BBF7B]">
                67% margin
              </span>
            </div>
            <div className="my-3 h-px bg-border" />

            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase mb-2">
              FIXED COSTS
            </p>

            {fixedCosts.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between py-2"
              >
                <span className="font-sans text-[13px] text-text-primary">
                  {c.label}
                </span>
                <span className="font-sans text-[13px] text-text-primary">
                  {c.amount}
                </span>
              </div>
            ))}

            <button className="mt-2 w-full rounded-md border border-border py-1.5 text-center font-sans text-[12px] text-text-muted">
              + Add Cost
            </button>

            <div className="my-3 h-px bg-border" />
            <div className="flex items-center justify-between py-2">
              <span className="font-sans text-[13px] font-semibold text-text-primary">
                Total Costs
              </span>
              <span className="font-sans text-[13px] font-semibold text-text-primary">
                {"\u20AC2,533"}
              </span>
            </div>

            <div className="my-3 h-px bg-gold" />

            <div className="flex items-center justify-between rounded-md bg-[#0D1E0D] px-4 py-3">
              <span className="font-sans text-[13px] font-semibold text-[#6BBF7B]">
                Net Profit
              </span>
              <span className="font-sans text-[13px] font-semibold text-[#6BBF7B]">
                {"\u20AC4,255"}
              </span>
            </div>
          </div>
        </div>

        {/* Right column — intentionally empty in this section */}
      </div>

      {/* ── Activity + Sidebar (two-col) ───────────────────────────── */}
      <div className="flex gap-4 px-8 mt-6 pb-8">
        {/* Recent Activity */}
        <div className="flex-1 rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-3">
            Recent Activity
          </h2>
          <div className="flex flex-col">
            {activities.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`}
                />
                <p className="flex-1 font-sans text-[13px] text-text-primary">
                  {a.description}
                </p>
                <span className="shrink-0 font-sans text-[11px] text-text-muted">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex w-[360px] flex-col gap-4">
          {/* Membership by Tier */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans text-[14px] font-medium text-text-primary">
                Membership by Tier
              </h3>
              <Link
                href="/admin/membership"
                className="font-sans text-[11px] text-accent-dim hover:text-accent"
              >
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {tiers.map((t) => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-[12px] text-text-secondary">
                      {t.name}
                    </span>
                    <span className="font-sans text-[12px] text-text-primary">
                      {t.count}
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-border">
                    <div
                      className={`h-1 rounded-full ${t.color} ${t.width}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <h3 className="font-sans text-[14px] font-medium text-text-primary mb-3">
              Newsletter
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  SUBSCRIBERS
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  2,341
                </p>
                <p className="font-sans text-[11px] text-[#6BBF7B]">+46.2%</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  OPEN RATE
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  48.2%
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  CLICK RATE
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  12.7%
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  SENT TODAY
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  1
                </p>
              </div>
            </div>
          </div>

          {/* The Scriptorium */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans text-[14px] font-medium text-text-primary">
                The Scriptorium
              </h3>
              <Link
                href="/admin/scriptorium"
                className="font-sans text-[11px] text-accent-dim hover:text-accent"
              >
                View all
              </Link>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  PRODUCTS
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  8
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  REVENUE
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  {"\u20AC2,341"}
                </p>
              </div>
            </div>
            <button className="w-full rounded-md border border-border py-1.5 text-center font-sans text-[12px] text-text-muted">
              Publish to Substack
            </button>
          </div>

          {/* Partnerships */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <h3 className="font-sans text-[14px] font-medium text-text-primary mb-3">
              Partnerships
            </h3>
            <div className="flex gap-6">
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  ACTIVE
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  5
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  MONTHLY REVENUE
                </p>
                <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                  {"\u20AC420"}
                </p>
              </div>
            </div>
          </div>

          {/* Quotes & Activity */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans text-[14px] font-medium text-text-primary">
                Quotes & Activity
              </h3>
              <Link
                href="/admin/quotes"
                className="font-sans text-[11px] text-accent-dim hover:text-accent"
              >
                Manage
              </Link>
            </div>
            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase mb-2">
              COLOR ROTATION
            </p>
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded bg-gold" />
              <div className="h-6 w-6 rounded bg-accent" />
              <div className="h-6 w-6 rounded bg-accent-dim" />
              <div className="h-6 w-6 rounded bg-warm-ivory" />
              <div className="h-6 w-6 rounded bg-starlight" />
              <div className="h-6 w-6 rounded bg-honey" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
