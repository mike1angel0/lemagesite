"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

type StatsProps = {
  stats: {
    totalUsers: number;
    totalMembers: number;
    contentCount: number;
    poemCount: number;
    photoCount: number;
    essayCount: number;
    productCount: number;
    subscriberCount: number;
    partnerCount: number;
  };
  tiers: {
    free: number;
    supporter: number;
    patron: number;
    innerCircle: number;
  };
};

export function AdminDashboardClient({ stats, tiers }: StatsProps) {
  const totalTiers = tiers.free + tiers.supporter + tiers.patron + tiers.innerCircle;
  const pct = (n: number) => (totalTiers > 0 ? Math.round((n / totalTiers) * 100) : 0);

  const statCards = [
    {
      label: "TOTAL MEMBERS",
      value: stats.totalUsers.toLocaleString(),
      change: `${stats.totalMembers} active memberships`,
      changeColor: "text-[#6BBF7B]",
    },
    {
      label: "CONTENT PIECES",
      value: stats.contentCount.toLocaleString(),
      change: `${stats.poemCount} poems \u00B7 ${stats.photoCount} photos \u00B7 ${stats.essayCount} essays`,
      changeColor: "text-text-secondary",
    },
    {
      label: "PRODUCTS",
      value: stats.productCount.toLocaleString(),
      change: "In the Scriptorium",
      changeColor: "text-text-secondary",
    },
    {
      label: "SUBSCRIBERS",
      value: stats.subscriberCount.toLocaleString(),
      change: "Newsletter subscribers",
      changeColor: "text-[#6BBF7B]",
    },
  ];

  const tierRows = [
    { name: "Free", count: tiers.free, color: "bg-text-muted", width: `${pct(tiers.free)}%` },
    { name: "Supporter", count: tiers.supporter, color: "bg-accent-dim", width: `${pct(tiers.supporter)}%` },
    { name: "Patron", count: tiers.patron, color: "bg-accent", width: `${pct(tiers.patron)}%` },
    { name: "Inner Circle", count: tiers.innerCircle, color: "bg-gold", width: `${pct(tiers.innerCircle)}%` },
  ];

  return (
    <>
      {/* ── Top Bar ── */}
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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4 px-8 mt-6">
        {statCards.map((s) => (
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

      {/* ── Membership + Partners (two-col) ── */}
      <div className="flex gap-4 px-8 mt-6 pb-8">
        {/* Membership by Tier */}
        <div className="flex-1 rounded-lg border border-border bg-bg-card p-5">
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
            {tierRows.map((t) => (
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
                    className={`h-1 rounded-full ${t.color}`}
                    style={{ width: t.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex w-[360px] flex-col gap-4">
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
                  {stats.subscriberCount.toLocaleString()}
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
            <div>
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                PRODUCTS
              </p>
              <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                {stats.productCount}
              </p>
            </div>
          </div>

          {/* Partnerships */}
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <h3 className="font-sans text-[14px] font-medium text-text-primary mb-3">
              Partnerships
            </h3>
            <div>
              <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
                ACTIVE
              </p>
              <p className="font-serif text-[22px] font-light text-text-primary leading-tight mt-1">
                {stats.partnerCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── OpenAI Usage ── */}
      <div className="px-8 pb-8">
        <OpenAIUsageCard />
      </div>
    </>
  );
}

// ── OpenAI Usage Card ──────────────────────────────────────

type UsageData = {
  currentMonth: {
    totalCost: number;
    completions: { cost: number; requests: number; inputTokens: number; outputTokens: number; avgPerRequest: number };
    images: { cost: number; requests: number; avgPerImage: number };
    tts: { cost: number; requests: number; avgPerAudio: number };
    daily: { date: string; cost: number }[];
  };
  previousMonth: {
    totalCost: number;
  };
  budget: number | null;
  remaining: number | null;
};

function OpenAIUsageCard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/openai-usage")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-5">
        <h3 className="font-sans text-[14px] font-medium text-text-primary mb-3">
          OpenAI Usage
        </h3>
        <p className="font-sans text-[11px] text-text-muted animate-pulse">Loading usage data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-5">
        <h3 className="font-sans text-[14px] font-medium text-text-primary mb-3">
          OpenAI Usage
        </h3>
        <p className="font-sans text-[11px] text-red-400">{error || "Failed to load"}</p>
      </div>
    );
  }

  const { currentMonth, previousMonth } = data;
  const costChange = previousMonth.totalCost > 0
    ? ((currentMonth.totalCost - previousMonth.totalCost) / previousMonth.totalCost) * 100
    : 0;
  const maxDaily = Math.max(...currentMonth.daily.map((d) => d.cost), 0.01);

  function formatTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  }

  return (
    <div className="rounded-lg border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans text-[14px] font-medium text-text-primary">
          OpenAI Usage
        </h3>
        <span className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
          This Month
        </span>
      </div>

      {/* Total cost */}
      <div className="flex items-end gap-3 mb-5">
        <p className="font-serif text-[36px] font-light text-text-primary leading-none">
          ${currentMonth.totalCost.toFixed(2)}
        </p>
        {previousMonth.totalCost > 0 && (
          <span className={`font-sans text-[11px] mb-1 ${costChange > 0 ? "text-red-400" : "text-[#6BBF7B]"}`}>
            {costChange > 0 ? "+" : ""}{costChange.toFixed(0)}% vs last month
          </span>
        )}
      </div>

      {/* Daily chart */}
      {currentMonth.daily.length > 0 && (
        <div className="mb-5">
          <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase mb-2">
            Daily Spend
          </p>
          <div className="flex items-end gap-[2px] h-[48px]">
            {currentMonth.daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 bg-accent/60 hover:bg-accent rounded-t transition-colors group relative"
                style={{ height: `${Math.max((d.cost / maxDaily) * 100, 4)}%` }}
                title={`${d.date}: $${d.cost.toFixed(2)}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-text-muted">
              {currentMonth.daily[0]?.date}
            </span>
            <span className="font-mono text-[9px] text-text-muted">
              {currentMonth.daily[currentMonth.daily.length - 1]?.date}
            </span>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
            Completions
          </p>
          <p className="font-serif text-[18px] font-light text-text-primary leading-tight mt-1">
            ${currentMonth.completions.cost.toFixed(2)}
          </p>
          <p className="font-sans text-[10px] text-text-secondary mt-0.5">
            {currentMonth.completions.requests.toLocaleString()} reqs
          </p>
          <p className="font-sans text-[10px] text-text-muted">
            {formatTokens(currentMonth.completions.inputTokens)} in / {formatTokens(currentMonth.completions.outputTokens)} out
          </p>
          <p className="font-sans text-[10px] text-text-muted">
            ~${currentMonth.completions.avgPerRequest.toFixed(3)}/req
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
            Images
          </p>
          <p className="font-serif text-[18px] font-light text-text-primary leading-tight mt-1">
            ${currentMonth.images.cost.toFixed(2)}
          </p>
          <p className="font-sans text-[10px] text-text-secondary mt-0.5">
            {currentMonth.images.requests.toLocaleString()} generated
          </p>
          <p className="font-sans text-[10px] text-text-muted">
            ~${currentMonth.images.avgPerImage.toFixed(3)}/img
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">
            TTS Audio
          </p>
          <p className="font-serif text-[18px] font-light text-text-primary leading-tight mt-1">
            ${currentMonth.tts.cost.toFixed(2)}
          </p>
          <p className="font-sans text-[10px] text-text-secondary mt-0.5">
            {currentMonth.tts.requests.toLocaleString()} generated
          </p>
          <p className="font-sans text-[10px] text-text-muted">
            ~${currentMonth.tts.avgPerAudio.toFixed(3)}/audio
          </p>
        </div>
      </div>

      {/* Previous month + Budget */}
      <div className="mt-4 pt-3 border-t border-border flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[11px] text-text-secondary">Last month total</span>
          <span className="font-sans text-[11px] text-text-primary">${previousMonth.totalCost.toFixed(2)}</span>
        </div>
        {data.budget !== null && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] text-text-secondary">Monthly budget</span>
              <span className="font-sans text-[11px] text-text-primary">${data.budget.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] text-text-secondary">Remaining</span>
              <span className={`font-sans text-[11px] font-medium ${(data.remaining ?? 0) > 0 ? "text-[#6BBF7B]" : "text-red-400"}`}>
                ${(data.remaining ?? 0).toFixed(2)}
              </span>
            </div>
            {/* Budget usage bar */}
            <div className="h-1.5 w-full rounded-full bg-border mt-1">
              <div
                className={`h-1.5 rounded-full transition-all ${(data.remaining ?? 0) > 0 ? "bg-accent" : "bg-red-400"}`}
                style={{ width: `${Math.min((currentMonth.totalCost / data.budget) * 100, 100)}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
