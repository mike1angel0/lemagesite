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
  };
}
