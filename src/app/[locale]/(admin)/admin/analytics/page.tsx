import {
  ChevronDown,
  Download,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const stats = [
  {
    label: "PAGE VIEWS",
    value: "28.4K",
    change: "+18%",
    changeColor: "text-[#6BBF7B]",
  },
  {
    label: "VISITORS",
    value: "8,921",
    change: "+12%",
    changeColor: "text-[#6BBF7B]",
  },
  {
    label: "AVG. SESSION",
    value: "4m 32s",
    change: null,
    changeColor: "text-text-secondary",
  },
  {
    label: "BOUNCE RATE",
    value: "32.1%",
    change: null,
    changeColor: "text-text-secondary",
  },
  {
    label: "REVENUE",
    value: "\u20AC3,842",
    change: "+6%",
    changeColor: "text-[#6BBF7B]",
  },
];

const topPages = [
  { page: "Cartography of Silence", views: "3,241" },
  { page: "Winter Light Series", views: "2,108" },
  { page: "On the Architecture of Memory", views: "1,847" },
  { page: "Nocturne in Blue Minor", views: "1,523" },
  { page: "The Weight of Light", views: "1,102" },
];

const newsletterStats = [
  { label: "SUBSCRIBERS", value: "2,341" },
  { label: "OPEN RATE", value: "64.2%" },
  { label: "CLICK RATE", value: "18.7%" },
  { label: "UNSUBSCRIBE", value: "0.8%" },
];

const subscriptionTiers = [
  { name: "Poetry", pct: 40, color: "bg-accent" },
  { name: "Essays", pct: 25, color: "bg-gold" },
  { name: "Photography", pct: 20, color: "bg-accent-dim" },
  { name: "Music", pct: 10, color: "bg-starlight" },
  { name: "Other", pct: 5, color: "bg-text-muted" },
];

const bookSales = [
  { title: "Cartography of Silence", sales: 142, revenue: "\u20AC2,130" },
  { title: "Winter Light: Collected Poems", sales: 87, revenue: "\u20AC1,044" },
  { title: "The Weight of Light (Chapbook)", sales: 56, revenue: "\u20AC668" },
];

const contentTypes = [
  { label: "Poetry", pct: 35 },
  { label: "Photography", pct: 25 },
  { label: "Essays", pct: 20 },
  { label: "Music", pct: 10 },
  { label: "Books", pct: 7 },
  { label: "Other", pct: 3 },
];

const funnelSteps = [
  { label: "Visitors", value: "28,432", pct: 100 },
  { label: "Engaged", value: "3,347", pct: 38 },
  { label: "Subscribers", value: "847", pct: 18 },
  { label: "Paying", value: "142", pct: 8 },
];

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminAnalyticsPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Analytics
        </h1>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors">
            Last 30 days
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-5 gap-4 px-8 mt-6">
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
            {s.change && (
              <p className={`font-sans text-[11px] ${s.changeColor}`}>
                {s.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Traffic Over Time ── */}
      <div className="px-8 mt-6">
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[14px] font-medium text-text-primary">
              Traffic Over Time
            </h2>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </div>
          <div className="h-[200px] flex items-center justify-center rounded-md bg-bg-elevated">
            <span className="font-sans text-[13px] text-text-muted">
              Traffic Chart
            </span>
          </div>
        </div>
      </div>

      {/* ── Top Pages ── */}
      <div className="px-8 mt-6">
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">
            Top Pages
          </h2>
          <div className="flex flex-col">
            {topPages.map((item, i) => (
              <div
                key={item.page}
                className="flex items-center justify-between border-b border-border py-3.5 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-text-muted w-4">
                    {i + 1}
                  </span>
                  <span className="font-sans text-[13px] text-text-primary">
                    {item.page}
                  </span>
                </div>
                <span className="font-mono text-[12px] text-text-secondary">
                  {item.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter Performance ── */}
      <div className="px-8 mt-6">
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">
            Newsletter Performance
          </h2>
          <div className="flex items-center gap-8 mb-6">
            {newsletterStats.map((ns) => (
              <div key={ns.label} className="flex flex-col gap-1">
                <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                  {ns.label}
                </p>
                <p className="font-serif text-[24px] font-light leading-none text-text-primary">
                  {ns.value}
                </p>
              </div>
            ))}
          </div>
          <div className="h-[120px] flex items-center justify-center rounded-md bg-bg-elevated">
            <span className="font-sans text-[13px] text-text-muted">
              Color Bar Chart
            </span>
          </div>
        </div>
      </div>

      {/* ── Subscription Performance + Book Sales ── */}
      <div className="grid grid-cols-2 gap-4 px-8 mt-6">
        {/* Subscription Performance */}
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">
            Subscription Performance
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                TOTAL REVENUE
              </p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">
                {"\u20AC3,842"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                NEW SUBSCRIBERS
              </p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">
                36
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                CHURN RATE
              </p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">
                1.23
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                LTV
              </p>
              <p className="font-serif text-[28px] font-light leading-none text-text-primary">
                {"\u20AC13,712"}
              </p>
            </div>
          </div>
          <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase mb-3">
            TIER BREAKDOWN
          </p>
          <div className="flex flex-col gap-2.5">
            {subscriptionTiers.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-[12px] text-text-secondary">
                    {t.name}
                  </span>
                  <span className="font-sans text-[12px] text-text-primary">
                    {t.pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border">
                  <div
                    className={`h-1.5 rounded-full ${t.color}`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book Sales */}
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">
            Book Sales
          </h2>
          <div className="flex flex-col">
            {bookSales.map((book) => (
              <div
                key={book.title}
                className="flex items-center justify-between border-b border-border py-3.5 last:border-b-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[13px] text-text-primary">
                    {book.title}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {book.sales} sold
                  </span>
                </div>
                <span className="font-sans text-[14px] font-medium text-text-primary">
                  {book.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Views by Content Type + Visitor Funnel ── */}
      <div className="grid grid-cols-2 gap-4 px-8 mt-6 pb-8">
        {/* Views by Content Type */}
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[14px] font-medium text-text-primary">
              Views by Content Type
            </h2>
            <BarChart3 className="h-4 w-4 text-text-muted" />
          </div>
          <div className="flex flex-col gap-3">
            {contentTypes.map((ct) => (
              <div key={ct.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-[12px] text-text-secondary">
                    {ct.label}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {ct.pct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${ct.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Funnel */}
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4">
            Visitor Funnel
          </h2>
          <div className="flex flex-col gap-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {i > 0 && (
                      <ArrowRight className="h-3 w-3 text-text-muted" />
                    )}
                    <span className="font-sans text-[13px] text-text-primary">
                      {step.label}
                    </span>
                  </div>
                  <span className="font-serif text-[20px] font-light text-text-primary">
                    {step.value}
                  </span>
                </div>
                <div className="h-3 w-full rounded bg-border">
                  <div
                    className="h-3 rounded bg-accent-dim"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
