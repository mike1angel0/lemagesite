import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OPENAI_BASE = "https://api.openai.com/v1";

async function openaiGet(path: string) {
  const res = await fetch(`${OPENAI_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${text}`);
  }
  return res.json();
}

function startOfMonth(): number {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
}

function startOfPrevMonth(): number {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
}

function endOfPrevMonth(): number {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime() / 1000);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Math.floor(Date.now() / 1000);
    const monthStart = startOfMonth();
    const prevStart = startOfPrevMonth();
    const prevEnd = endOfPrevMonth();

    // Fetch usage data for current month and previous month in parallel
    const [
      completionsCurrent,
      completionsPrev,
      imagesCurrent,
      imagesPrev,
      speechCurrent,
      speechPrev,
    ] = await Promise.all([
      openaiGet(`/organization/usage/completions?start_time=${monthStart}&end_time=${now}&bucket_width=1d`).catch(() => null),
      openaiGet(`/organization/usage/completions?start_time=${prevStart}&end_time=${prevEnd}&bucket_width=1d`).catch(() => null),
      openaiGet(`/organization/usage/images?start_time=${monthStart}&end_time=${now}&bucket_width=1d`).catch(() => null),
      openaiGet(`/organization/usage/images?start_time=${prevStart}&end_time=${prevEnd}&bucket_width=1d`).catch(() => null),
      openaiGet(`/organization/usage/audio_speeches?start_time=${monthStart}&end_time=${now}&bucket_width=1d`).catch(() => null),
      openaiGet(`/organization/usage/audio_speeches?start_time=${prevStart}&end_time=${prevEnd}&bucket_width=1d`).catch(() => null),
    ]);

    // Sum up costs from bucket data
    function sumCosts(data: Record<string, unknown> | null): number {
      if (!data) return 0;
      const buckets = (data as { data?: { results?: { amount?: { value?: number } }[] }[] }).data;
      if (!Array.isArray(buckets)) return 0;
      let total = 0;
      for (const bucket of buckets) {
        if (Array.isArray(bucket.results)) {
          for (const r of bucket.results) {
            total += r.amount?.value ?? 0;
          }
        }
      }
      // OpenAI returns costs in cents
      return total / 100;
    }

    function sumTokens(data: Record<string, unknown> | null, field: string): number {
      if (!data) return 0;
      const buckets = (data as { data?: { results?: Record<string, unknown>[] }[] }).data;
      if (!Array.isArray(buckets)) return 0;
      let total = 0;
      for (const bucket of buckets) {
        if (Array.isArray(bucket.results)) {
          for (const r of bucket.results) {
            total += (r[field] as number) ?? 0;
          }
        }
      }
      return total;
    }

    function sumRequests(data: Record<string, unknown> | null): number {
      if (!data) return 0;
      const buckets = (data as { data?: { results?: { num_model_requests?: number }[] }[] }).data;
      if (!Array.isArray(buckets)) return 0;
      let total = 0;
      for (const bucket of buckets) {
        if (Array.isArray(bucket.results)) {
          for (const r of bucket.results) {
            total += r.num_model_requests ?? 0;
          }
        }
      }
      return total;
    }

    // Build daily cost chart data from current month completions
    function buildDailyData(completions: Record<string, unknown> | null, images: Record<string, unknown> | null, speech: Record<string, unknown> | null) {
      const dailyMap: Record<string, number> = {};

      function addBuckets(data: Record<string, unknown> | null) {
        if (!data) return;
        const buckets = (data as { data?: { start_time?: number; results?: { amount?: { value?: number } }[] }[] }).data;
        if (!Array.isArray(buckets)) return;
        for (const bucket of buckets) {
          const date = bucket.start_time ? new Date(bucket.start_time * 1000).toISOString().slice(5, 10) : "unknown";
          let cost = 0;
          if (Array.isArray(bucket.results)) {
            for (const r of bucket.results) {
              cost += r.amount?.value ?? 0;
            }
          }
          dailyMap[date] = (dailyMap[date] ?? 0) + cost / 100;
        }
      }

      addBuckets(completions);
      addBuckets(images);
      addBuckets(speech);

      return Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }));
    }

    const completionsCost = sumCosts(completionsCurrent);
    const imagesCost = sumCosts(imagesCurrent);
    const ttsCost = sumCosts(speechCurrent);
    const completionsReqs = sumRequests(completionsCurrent);
    const imagesReqs = sumRequests(imagesCurrent);
    const ttsReqs = sumRequests(speechCurrent);

    const currentCost = completionsCost + imagesCost + ttsCost;
    const prevCost = sumCosts(completionsPrev) + sumCosts(imagesPrev) + sumCosts(speechPrev);

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const avg = (cost: number, reqs: number) => reqs > 0 ? round2(cost / reqs) : 0;

    // Get monthly budget from SiteSetting
    const budgetSetting = await prisma.siteSetting.findUnique({
      where: { key: "openai_monthly_budget" },
    });
    const monthlyBudget = budgetSetting ? parseFloat(budgetSetting.value) : null;

    return NextResponse.json({
      currentMonth: {
        totalCost: round2(currentCost),
        completions: {
          cost: round2(completionsCost),
          requests: completionsReqs,
          inputTokens: sumTokens(completionsCurrent, "input_tokens"),
          outputTokens: sumTokens(completionsCurrent, "output_tokens"),
          avgPerRequest: avg(completionsCost, completionsReqs),
        },
        images: {
          cost: round2(imagesCost),
          requests: imagesReqs,
          avgPerImage: avg(imagesCost, imagesReqs),
        },
        tts: {
          cost: round2(ttsCost),
          requests: ttsReqs,
          avgPerAudio: avg(ttsCost, ttsReqs),
        },
        daily: buildDailyData(completionsCurrent, imagesCurrent, speechCurrent),
      },
      previousMonth: {
        totalCost: round2(prevCost),
      },
      budget: monthlyBudget,
      remaining: monthlyBudget !== null ? round2(monthlyBudget - currentCost) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OpenAI usage fetch error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
