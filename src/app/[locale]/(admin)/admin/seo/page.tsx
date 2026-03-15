"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Wrench,
  Globe,
  FileText,
  Search,
  Zap,
  BarChart3,
  Link2,
  ExternalLink,
  Code2,
  Type,
  Image as ImageIcon,
  Clock,
  Download,
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  runSeoAuditAction,
  applySeoFixAction,
  applyAllFixesAction,
  type AuditResult,
  type PageAudit,
  type PageCheck,
  type SeoFix,
  type CheckStatus,
  type InfraStatus,
} from "@/lib/actions/seo";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number) {
  if (score >= 80) return "text-[#6BBF7B]";
  if (score >= 50) return "text-gold";
  return "text-[#E57373]";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-[#6BBF7B]/10 text-[#6BBF7B]";
  if (score >= 50) return "bg-gold/10 text-gold";
  return "bg-[#E57373]/10 text-[#E57373]";
}

function impactBadge(impact: SeoFix["impact"]) {
  switch (impact) {
    case "critical":
      return "bg-[#E57373]/10 text-[#E57373]";
    case "high":
      return "bg-gold/10 text-gold";
    case "medium":
      return "bg-accent/10 text-accent";
    case "low":
      return "bg-bg-elevated text-text-muted";
  }
}

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle className="h-4 w-4 shrink-0 text-[#6BBF7B]" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />;
    case "fail":
      return <XCircle className="h-4 w-4 shrink-0 text-[#E57373]" />;
  }
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 80 ? "#6BBF7B" : score >= 50 ? "#C9A94E" : "#E57373";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-serif text-[36px] font-light leading-none" style={{ color }}>
          {score}
        </span>
        <span className="font-mono text-[10px] text-text-muted tracking-wider">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fix Button                                                         */
/* ------------------------------------------------------------------ */

function FixButton({
  fix,
  onApply,
  compact,
}: {
  fix: SeoFix;
  onApply: (fixId: string) => Promise<void>;
  compact?: boolean;
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      await onApply(fix.id);
      setApplied(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setApplying(false);
    }
  };

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6BBF7B]">
        <CheckCircle className="h-3 w-3" /> Applied
      </span>
    );
  }

  if (error) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#E57373]">
        <XCircle className="h-3 w-3" /> {error}
      </span>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={applying}
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-accent/30 bg-accent/10 font-sans text-accent hover:bg-accent/20 transition-colors disabled:opacity-50",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
      )}
      title={fix.description}
    >
      {applying ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Wrench className="h-3 w-3" />
      )}
      {applying ? "Applying..." : fix.label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SERP Preview                                                       */
/* ------------------------------------------------------------------ */

function SerpPreview({ serp }: { serp: PageAudit["serp"] }) {
  return (
    <div className="rounded-lg bg-white p-4 border border-border/50">
      <p className="font-sans text-[18px] text-[#1a0dab] leading-snug line-clamp-1">
        {serp.title || "No title"}
      </p>
      <p className="font-sans text-[13px] text-[#006621] mt-0.5 line-clamp-1">
        {serp.url}
      </p>
      <p className="font-sans text-[13px] text-[#545454] mt-0.5 line-clamp-2">
        {serp.description || "No description available."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Expandable Page Row                                                */
/* ------------------------------------------------------------------ */

function PageRow({
  page,
  onApplyFix,
}: {
  page: PageAudit;
  onApplyFix: (fixId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const issues = page.checks.filter((c) => c.status !== "pass");
  const fixIds = new Set<string>();
  const uniqueFixes: SeoFix[] = [];
  for (const check of page.checks) {
    if (check.fix && !fixIds.has(check.fix.id)) {
      fixIds.add(check.fix.id);
      uniqueFixes.push(check.fix);
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/30 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
        )}
        <span className="font-sans text-[13px] text-text-primary font-medium flex-1 truncate">
          {page.label}
        </span>
        <span className="font-mono text-[10px] text-text-muted hidden md:inline">
          {page.path}
        </span>
        {/* Mini stats */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {page.responseTimeMs > 0 && (
            <span className={cn("font-mono text-[10px] hidden lg:inline", page.responseTimeMs > 1000 ? "text-gold" : "text-text-muted")}>
              {page.responseTimeMs}ms
            </span>
          )}
          {page.wordCount > 0 && (
            <span className="font-mono text-[10px] text-text-muted hidden lg:inline">
              {page.wordCount}w
            </span>
          )}
          {issues.length > 0 && (
            <span className="font-mono text-[10px] text-[#E57373]">
              {issues.length} issue{issues.length !== 1 ? "s" : ""}
            </span>
          )}
          {uniqueFixes.length > 0 && (
            <span className="font-mono text-[10px] text-accent">
              {uniqueFixes.length} fix{uniqueFixes.length !== 1 ? "es" : ""}
            </span>
          )}
          <span
            className={cn(
              "font-mono text-[11px] font-medium px-2 py-0.5 rounded min-w-[36px] text-center",
              scoreBg(page.score),
            )}
          >
            {page.score}
          </span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border">
          {/* SERP Preview */}
          <div className="px-4 pt-4 pb-3">
            <p className="font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-2 flex items-center gap-1.5">
              <Search className="h-3 w-3" /> Google Preview
            </p>
            <SerpPreview serp={page.serp} />
          </div>

          {/* Stats row */}
          <div className="px-4 pb-3 flex gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
              <Type className="h-3 w-3" /> {page.wordCount} words
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
              <Link2 className="h-3 w-3" /> {page.internalLinks} internal links
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
              <ExternalLink className="h-3 w-3" /> {page.externalLinks} external links
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
              <Code2 className="h-3 w-3" /> JSON-LD: {page.hasJsonLd ? "Yes" : "No"}
            </span>
            <span className={cn("flex items-center gap-1.5 font-mono text-[10px]", page.responseTimeMs > 1000 ? "text-gold" : "text-text-muted")}>
              <Clock className="h-3 w-3" /> {page.responseTimeMs}ms
            </span>
          </div>

          {/* Checks */}
          <div className="px-4 pb-3 space-y-1.5">
            <p className="font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" /> Checks
            </p>
            {page.checks.map((check, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md bg-bg-surface/30 px-3 py-2"
              >
                <StatusIcon status={check.status} />
                <span className="font-sans text-[12px] text-text-primary min-w-[130px]">
                  {check.name}
                </span>
                <span className="font-sans text-[11px] text-text-secondary flex-1 truncate">
                  {check.detail}
                </span>
              </div>
            ))}
          </div>

          {/* Heading structure */}
          {page.headingStructure.length > 0 && (
            <div className="px-4 pb-3">
              <details className="group">
                <summary className="font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase cursor-pointer flex items-center gap-1.5">
                  <Type className="h-3 w-3" /> Heading structure ({page.headingStructure.length})
                </summary>
                <div className="mt-2 space-y-0.5 pl-4 border-l border-border">
                  {page.headingStructure.map((h, i) => {
                    const level = parseInt(h[1]) || 1;
                    return (
                      <p
                        key={i}
                        className="font-mono text-[11px] text-text-secondary"
                        style={{ paddingLeft: `${(level - 1) * 12}px` }}
                      >
                        {h}
                      </p>
                    );
                  })}
                </div>
              </details>
            </div>
          )}

          {/* Fixes */}
          {uniqueFixes.length > 0 && (
            <div className="px-4 pb-4 pt-1 border-t border-border/50">
              <p className="font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-2 flex items-center gap-1.5">
                <Zap className="h-3 w-3" /> Available Fixes
              </p>
              <div className="space-y-2">
                {uniqueFixes.map((fix) => (
                  <div
                    key={fix.id}
                    className="flex items-center gap-3 rounded-md bg-accent/5 border border-accent/10 px-3 py-2"
                  >
                    <span className={cn("font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded", impactBadge(fix.impact))}>
                      {fix.impact}
                    </span>
                    <span className="font-sans text-[12px] text-text-secondary flex-1">
                      {fix.description}
                    </span>
                    <FixButton fix={fix} onApply={onApplyFix} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab type                                                           */
/* ------------------------------------------------------------------ */

type Tab = "overview" | "pages" | "content";

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

type AuditHistoryEntry = { score: number; timestamp: string; pages: number; fixes: number };

function getAuditHistory(): AuditHistoryEntry[] {
  try {
    const raw = localStorage.getItem("seo-audit-history");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAuditHistory(entry: AuditHistoryEntry) {
  const history = getAuditHistory();
  history.push(entry);
  // Keep last 20 entries
  if (history.length > 20) history.splice(0, history.length - 20);
  localStorage.setItem("seo-audit-history", JSON.stringify(history));
}

export default function AdminSEOPage() {
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [applyingAll, setApplyingAll] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());
  const [auditHistory, setAuditHistory] = useState<AuditHistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    setAuditHistory(getAuditHistory());
  }, []);

  const handleRunAudit = async () => {
    setLoading(true);
    setError(null);
    setAppliedFixes(new Set());
    try {
      const result = await runSeoAuditAction();
      if ("error" in result) {
        setError(result.error);
      } else {
        setAudit(result);
        // Save to history
        const entry: AuditHistoryEntry = {
          score: result.score,
          timestamp: result.timestamp,
          pages: result.pages.length,
          fixes: result.summary.fixableCount,
        };
        saveAuditHistory(entry);
        setAuditHistory(getAuditHistory());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = async (fixId: string) => {
    const result = await applySeoFixAction(fixId);
    if (result.error) throw new Error(result.error);
    setAppliedFixes((prev) => new Set(prev).add(fixId));
  };

  const handleExportReport = () => {
    if (!audit) return;
    const report = {
      ...audit,
      exportedAt: new Date().toISOString(),
      site: "theselenarium.art",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyAll = async () => {
    if (!audit) return;
    setApplyingAll(true);
    try {
      // Collect all fix IDs
      const allFixes = new Set<string>();
      audit.infrastructure.forEach((i) => { if (i.fix) allFixes.add(i.fix.id); });
      audit.pages.forEach((p) =>
        p.checks.forEach((c) => { if (c.fix) allFixes.add(c.fix.id); }),
      );
      audit.contentGaps.forEach((g) => allFixes.add(g.fix.id));

      const fixIds = Array.from(allFixes).filter((id) => !appliedFixes.has(id));
      if (fixIds.length === 0) return;

      const { results } = await applyAllFixesAction(fixIds);
      const newApplied = new Set(appliedFixes);
      for (const r of results) {
        if (r.success) newApplied.add(r.id);
      }
      setAppliedFixes(newApplied);
    } finally {
      setApplyingAll(false);
    }
  };

  // Derived counts
  const allFixIds = new Set<string>();
  if (audit) {
    audit.infrastructure.forEach((i) => { if (i.fix) allFixIds.add(i.fix.id); });
    audit.pages.forEach((p) => p.checks.forEach((c) => { if (c.fix) allFixIds.add(c.fix.id); }));
    audit.contentGaps.forEach((g) => allFixIds.add(g.fix.id));
  }
  const remainingFixes = Array.from(allFixIds).filter((id) => !appliedFixes.has(id)).length;

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          SEO Command Center
        </h1>
        <div className="flex items-center gap-3">
          {audit && (
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-muted hover:text-text-primary hover:border-text-muted transition-colors"
              title="Export audit report as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          )}
          {audit && remainingFixes > 0 && (
            <button
              onClick={handleApplyAll}
              disabled={applyingAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent/10 px-4 py-2 font-sans text-[12px] font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              {applyingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {applyingAll
                ? "Applying..."
                : `Apply All Fixes (${remainingFixes})`}
            </button>
          )}
          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Activity className="h-3.5 w-3.5" />
            )}
            {loading ? "Auditing..." : audit ? "Re-run Audit" : "Run SEO Audit"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-4 rounded-lg border border-[#E57373]/30 bg-[#E57373]/10 px-4 py-3">
          <p className="font-sans text-[13px] text-[#E57373]">{error}</p>
        </div>
      )}

      {!audit && !loading && (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <div className="relative">
            <Globe className="h-16 w-16 text-text-muted/30" />
            <Search className="h-8 w-8 text-accent absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center max-w-md">
            <h2 className="font-sans text-[16px] font-medium text-text-primary mb-2">
              Analyze your site&apos;s SEO health
            </h2>
            <p className="font-sans text-[13px] text-text-muted leading-relaxed">
              Run a comprehensive audit to check metadata, structured data,
              sitemap, robots.txt, content quality, heading hierarchy, and
              more. Get actionable fixes you can apply with one click.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
          <p className="font-sans text-[13px] text-text-muted">
            Fetching and analyzing all public pages...
          </p>
        </div>
      )}

      {audit && !loading && (
        <>
          {/* ── Tabs ── */}
          <div className="flex items-center gap-0 border-b border-border px-8 pt-4">
            {(
              [
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "pages", label: `Pages (${audit.pages.length})`, icon: FileText },
                { id: "content", label: `Content (${audit.contentGaps.length})`, icon: ImageIcon },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 font-sans text-[13px] border-b-2 -mb-px transition-colors",
                  tab === t.id
                    ? "border-accent text-accent font-medium"
                    : "border-transparent text-text-muted hover:text-text-primary",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Overview ── */}
          {tab === "overview" && (
            <div className="px-8 py-6 space-y-6">
              {/* Score + Summary */}
              <div className="flex items-start gap-8">
                <ScoreRing score={audit.score} />
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="rounded-lg border border-border bg-bg-card p-4">
                    <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                      Total Checks
                    </p>
                    <p className="font-serif text-[28px] font-light leading-none text-text-primary mt-1">
                      {audit.summary.totalChecks}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-card p-4">
                    <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                      Passed
                    </p>
                    <p className="font-serif text-[28px] font-light leading-none text-[#6BBF7B] mt-1">
                      {audit.summary.passed}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-card p-4">
                    <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                      Warnings
                    </p>
                    <p className="font-serif text-[28px] font-light leading-none text-gold mt-1">
                      {audit.summary.warnings}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-card p-4">
                    <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                      Failures
                    </p>
                    <p className="font-serif text-[28px] font-light leading-none text-[#E57373] mt-1">
                      {audit.summary.failures}
                    </p>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="rounded-lg border border-border bg-bg-card p-5">
                <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-text-muted" />
                  Infrastructure
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audit.infrastructure.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
                    >
                      <StatusIcon status={item.status} />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] text-text-primary">
                          {item.name}
                        </p>
                        <p className="font-sans text-[11px] text-text-muted truncate">
                          {item.detail}
                        </p>
                      </div>
                      {item.fix && (
                        <FixButton fix={item.fix} onApply={handleApplyFix} compact />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top issues */}
              <div className="rounded-lg border border-border bg-bg-card p-5">
                <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gold" />
                  Top Issues
                </h2>
                <div className="space-y-2">
                  {(() => {
                    const issues: { page: string; check: PageCheck }[] = [];
                    audit.pages.forEach((p) =>
                      p.checks
                        .filter((c) => c.status === "fail")
                        .forEach((c) => issues.push({ page: p.label, check: c })),
                    );
                    audit.pages.forEach((p) =>
                      p.checks
                        .filter((c) => c.status === "warning")
                        .forEach((c) => issues.push({ page: p.label, check: c })),
                    );
                    return issues.slice(0, 12).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-md bg-bg-surface/30 px-3 py-2"
                      >
                        <StatusIcon status={item.check.status} />
                        <span className="font-sans text-[12px] text-text-muted min-w-[80px]">
                          {item.page}
                        </span>
                        <span className="font-sans text-[12px] text-text-primary min-w-[120px]">
                          {item.check.name}
                        </span>
                        <span className="font-sans text-[11px] text-text-secondary flex-1 truncate">
                          {item.check.detail}
                        </span>
                        {item.check.fix && (
                          <FixButton
                            fix={item.check.fix}
                            onApply={handleApplyFix}
                            compact
                          />
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Recommendations */}
              <div className="rounded-lg border border-border bg-bg-card p-5">
                <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link
                    href="/admin/seo/editor"
                    className="flex items-center gap-3 rounded-md border border-border px-4 py-3 hover:bg-bg-elevated/30 transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-accent" />
                    <div>
                      <p className="font-sans text-[13px] text-text-primary font-medium">
                        SEO Editor
                      </p>
                      <p className="font-sans text-[11px] text-text-muted">
                        Edit meta titles &amp; descriptions per page
                      </p>
                    </div>
                  </Link>
                  {audit.summary.fixableCount > 0 && (
                    <button
                      onClick={() => setTab("pages")}
                      className="flex items-center gap-3 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 hover:bg-accent/10 transition-colors text-left"
                    >
                      <Wrench className="h-4 w-4 text-accent" />
                      <div>
                        <p className="font-sans text-[13px] text-text-primary font-medium">
                          {audit.summary.fixableCount} Auto-Fixes Available
                        </p>
                        <p className="font-sans text-[11px] text-text-muted">
                          Apply fixes to improve score instantly
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Audit history trend */}
              {auditHistory.length > 1 && (
                <div className="rounded-lg border border-border bg-bg-card p-5">
                  <h2 className="font-sans text-[14px] font-medium text-text-primary mb-4 flex items-center gap-2">
                    <History className="h-4 w-4 text-text-muted" />
                    Score History
                  </h2>
                  <div className="flex items-end gap-1 h-20">
                    {auditHistory.slice(-10).map((entry, i) => {
                      const maxScore = Math.max(...auditHistory.slice(-10).map(e => e.score), 1);
                      const height = (entry.score / maxScore) * 100;
                      const color = entry.score >= 80 ? "#6BBF7B" : entry.score >= 50 ? "#C9A94E" : "#E57373";
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1"
                          title={`${entry.score}/100 — ${new Date(entry.timestamp).toLocaleDateString()}`}
                        >
                          <span className="font-mono text-[8px] text-text-muted">{entry.score}</span>
                          <div
                            className="w-full rounded-t-sm min-h-[4px] transition-all"
                            style={{ height: `${height}%`, backgroundColor: color, opacity: 0.7 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-mono text-[9px] text-text-muted">
                      {new Date(auditHistory[Math.max(0, auditHistory.length - 10)].timestamp).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-[9px] text-text-muted">
                      {(() => {
                        const prev = auditHistory[auditHistory.length - 2]?.score ?? 0;
                        const curr = auditHistory[auditHistory.length - 1]?.score ?? 0;
                        const diff = curr - prev;
                        if (diff > 0) return <span className="text-[#6BBF7B] inline-flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />+{diff} from last</span>;
                        if (diff < 0) return <span className="text-[#E57373] inline-flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />{diff} from last</span>;
                        return <span className="text-text-muted inline-flex items-center gap-0.5"><Minus className="h-3 w-3" />No change</span>;
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <p className="font-mono text-[10px] text-text-muted text-right">
                Audit at{" "}
                {new Date(audit.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* ── TAB: Pages ── */}
          {tab === "pages" && (
            <div className="px-8 py-6 space-y-3">
              {/* Page score bar */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-card p-4 overflow-hidden">
                {audit.pages.map((page) => (
                  <div
                    key={page.path}
                    className="flex-1 group relative"
                    title={`${page.label}: ${page.score}/100`}
                  >
                    <div className="h-6 rounded-sm" style={{
                      backgroundColor:
                        page.score >= 80
                          ? "#6BBF7B"
                          : page.score >= 50
                            ? "#C9A94E"
                            : "#E57373",
                      opacity: 0.2 + (page.score / 100) * 0.8,
                    }} />
                    <p className="font-mono text-[8px] text-text-muted text-center mt-1 truncate">
                      {page.label.split(" ")[0]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Page list */}
              <div className="space-y-2">
                {audit.pages.map((page) => (
                  <PageRow
                    key={page.path}
                    page={page}
                    onApplyFix={handleApplyFix}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: Content ── */}
          {tab === "content" && (
            <div className="px-8 py-6 space-y-6">
              {audit.contentGaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <CheckCircle className="h-12 w-12 text-[#6BBF7B]" />
                  <p className="font-sans text-[14px] text-text-primary">
                    No content gaps found
                  </p>
                  <p className="font-sans text-[12px] text-text-muted">
                    All your content has the metadata fields filled in.
                  </p>
                </div>
              ) : (
                <>
                  {/* Group by type */}
                  {(["Essay", "Research", "Photo", "Poem"] as const).map(
                    (type) => {
                      const items = audit.contentGaps.filter(
                        (g) => g.type === type,
                      );
                      if (items.length === 0) return null;
                      return (
                        <div
                          key={type}
                          className="rounded-lg border border-border bg-bg-card overflow-hidden"
                        >
                          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-sans text-[14px] font-medium text-text-primary">
                              {type}s
                              <span className="ml-2 font-mono text-[11px] text-text-muted">
                                ({items.length})
                              </span>
                            </h2>
                          </div>
                          <div className="divide-y divide-border">
                            {items.map((gap, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 px-5 py-3"
                              >
                                <AlertTriangle className="h-3.5 w-3.5 text-gold shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-sans text-[13px] text-text-primary truncate">
                                    {gap.title}
                                  </p>
                                  <p className="font-sans text-[11px] text-text-muted">
                                    {gap.issue}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={cn("font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded", impactBadge(gap.fix.impact))}>
                                    {gap.fix.impact}
                                  </span>
                                  <FixButton
                                    fix={gap.fix}
                                    onApply={handleApplyFix}
                                    compact
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
