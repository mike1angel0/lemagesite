"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" ? user : null;
}

export type AnalyticsData = {
  contentCounts: {
    poems: number;
    photos: number;
    essays: number;
    research: number;
    books: number;
    albums: number;
    events: number;
    total: number;
  };
  memberStats: {
    total: number;
    active: number;
    free: number;
    supporters: number;
    patrons: number;
    innerCircle: number;
    newsletterSubscribers: number;
  };
  orderStats: {
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
  };
  newsletterStats: {
    total: number;
    sent: number;
    drafts: number;
    scheduled: number;
  };
  viewStats: {
    topContent: { contentType: string; contentId: string; title: string; views: number }[];
    viewsPerDay: { date: string; count: number }[];
    viewsByType: { type: string; count: number }[];
  };
};

export async function getAnalyticsAction(): Promise<AnalyticsData | null> {
  const admin = await requireAdmin();
  if (!admin) return null;

  const [
    poems,
    photos,
    essays,
    research,
    books,
    albums,
    events,
    users,
    memberships,
    newsletterSubs,
    orders,
    paidOrders,
    newsletters,
  ] = await Promise.all([
    prisma.poem.count(),
    prisma.photo.count(),
    prisma.essay.count(),
    prisma.researchPaper.count(),
    prisma.book.count(),
    prisma.album.count(),
    prisma.event.count(),
    prisma.user.count(),
    prisma.membership.findMany({ select: { tier: true, status: true } }),
    prisma.user.count({ where: { newsletterSubscribed: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { total: true },
    }),
    prisma.newsletter.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  );

  const active = memberships.filter((m) => m.status === "ACTIVE").length;
  const free = memberships.filter((m) => m.tier === "FREE").length;
  const supporters = memberships.filter((m) => m.tier === "SUPPORTER").length;
  const patrons = memberships.filter((m) => m.tier === "PATRON").length;
  const innerCircle = memberships.filter((m) => m.tier === "INNER_CIRCLE").length;

  const newsletterCounts: Record<string, number> = {};
  for (const n of newsletters) {
    newsletterCounts[n.status] = n._count;
  }

  // View stats (wrapped in try/catch — table may not exist if migration not deployed)
  let topContent: { contentType: string; contentId: string; title: string; views: number }[] = [];
  let viewsPerDay: { date: string; count: number }[] = [];
  let viewsByType: { type: string; count: number }[] = [];

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [topViewed, allViews] = await Promise.all([
      prisma.contentView.groupBy({
        by: ["contentType", "contentId"],
        _count: true,
        orderBy: { _count: { contentId: "desc" } },
        take: 10,
      }),
      prisma.contentView.findMany({
        where: { viewedAt: { gte: thirtyDaysAgo } },
        select: { contentType: true, viewedAt: true },
      }),
    ]);

    // Resolve titles for top viewed
    topContent = await Promise.all(
      topViewed.map(async (v) => {
        let title = "";
        switch (v.contentType) {
          case "POEM": {
            const p = await prisma.poem.findUnique({ where: { id: v.contentId }, select: { title: true } });
            title = p?.title ?? "Unknown";
            break;
          }
          case "ESSAY": {
            const e = await prisma.essay.findUnique({ where: { id: v.contentId }, select: { title: true } });
            title = e?.title ?? "Unknown";
            break;
          }
          case "RESEARCH": {
            const r = await prisma.researchPaper.findUnique({ where: { id: v.contentId }, select: { title: true } });
            title = r?.title ?? "Unknown";
            break;
          }
          default:
            title = v.contentId;
        }
        return { contentType: v.contentType, contentId: v.contentId, title, views: v._count };
      })
    );

    // Views per day (last 30 days)
    const viewsPerDayMap: Record<string, number> = {};
    const viewsByTypeMap: Record<string, number> = {};
    for (const v of allViews) {
      const day = v.viewedAt.toISOString().split("T")[0];
      viewsPerDayMap[day] = (viewsPerDayMap[day] || 0) + 1;
      viewsByTypeMap[v.contentType] = (viewsByTypeMap[v.contentType] || 0) + 1;
    }

    viewsPerDay = Object.entries(viewsPerDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    viewsByType = Object.entries(viewsByTypeMap)
      .map(([type, count]) => ({ type, count }));
  } catch {
    // ContentView table may not exist yet — return empty view stats
  }

  return {
    contentCounts: {
      poems,
      photos,
      essays,
      research,
      books,
      albums,
      events,
      total: poems + photos + essays + research + books + albums,
    },
    memberStats: {
      total: users,
      active,
      free: users - supporters - patrons - innerCircle,
      supporters,
      patrons,
      innerCircle,
      newsletterSubscribers: newsletterSubs,
    },
    orderStats: {
      totalOrders: orders,
      paidOrders: paidOrders.length,
      totalRevenue,
    },
    newsletterStats: {
      total: (newsletterCounts.DRAFT || 0) + (newsletterCounts.SENT || 0) + (newsletterCounts.SCHEDULED || 0),
      sent: newsletterCounts.SENT || 0,
      drafts: newsletterCounts.DRAFT || 0,
      scheduled: newsletterCounts.SCHEDULED || 0,
    },
    viewStats: { topContent, viewsPerDay, viewsByType },
  };
}
