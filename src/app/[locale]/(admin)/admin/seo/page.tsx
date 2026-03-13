import {
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const seoStats = [
  {
    label: "HEALTH SCORE",
    value: "87/100",
    change: null,
    changeColor: "text-[#6BBF7B]",
    valueColor: "text-[#6BBF7B]",
  },
  {
    label: "INDEXED PAGES",
    value: "142",
    change: null,
    changeColor: "text-text-secondary",
    valueColor: "text-text-primary",
  },
  {
    label: "ORGANIC TRAFFIC",
    value: "12.8K",
    change: "+15%",
    changeColor: "text-[#6BBF7B]",
    valueColor: "text-text-primary",
  },
  {
    label: "AVG. POSITION",
    value: "14.2",
    change: null,
    changeColor: "text-text-secondary",
    valueColor: "text-text-secondary",
  },
];

const keywordColumns = ["KEYWORD", "POSITION", "IMPRESSIONS"];

const keywords = [
  { keyword: "romanian poetry online", position: "#1", impressions: "847" },
  {
    keyword: "cartography of silence poem",
    position: "#2",
    impressions: "623",
  },
  { keyword: "contemporary romanian poet", position: "#3", impressions: "518" },
  { keyword: "winter light photography", position: "#5", impressions: "412" },
  { keyword: "architecture of memory essay", position: "#7", impressions: "287" },
  { keyword: "nocturne blue minor music", position: "#9", impressions: "194" },
];

const auditItems = [
  { label: "Meta descriptions present on all pages", status: "pass" },
  { label: "All images have alt text", status: "pass" },
  { label: "Structured data (JSON-LD) valid", status: "pass" },
  { label: "Mobile responsiveness score", status: "warning" },
  { label: "Core Web Vitals passed", status: "pass" },
];

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminSEOPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          SEO
        </h1>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg">
          <Activity className="h-3.5 w-3.5" />
          Run SEO Audit
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4 px-8 mt-6">
        {seoStats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-5"
          >
            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
              {s.label}
            </p>
            <p
              className={`font-serif text-[32px] font-light leading-none ${s.valueColor}`}
            >
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

      {/* ── Two-column: Keywords + Page Audit ── */}
      <div className="grid grid-cols-2 gap-4 px-8 mt-6 pb-8">
        {/* Top Search Keywords */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-sans text-[14px] font-medium text-text-primary">
              Top Search Keywords
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                {keywordColumns.map((col) => (
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
              {keywords.map((row) => (
                <tr
                  key={row.keyword}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.keyword}
                  </td>
                  <td className="font-mono text-[12px] text-accent px-4 py-3.5">
                    {row.position}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.impressions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page Audit */}
        <div className="rounded-lg border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-sans text-[14px] font-medium text-text-primary">
              Page Audit
            </h2>
            <span className="rounded-md bg-[#6BBF7B]/10 px-2.5 py-1 font-mono text-[11px] font-medium text-[#6BBF7B]">
              97/100
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {auditItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
              >
                {item.status === "pass" ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#6BBF7B]" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
                )}
                <span className="font-sans text-[13px] text-text-primary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
