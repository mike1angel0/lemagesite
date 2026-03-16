import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import { buildRssFeed, rssResponse } from "@/lib/feed";

export async function GET() {
  const now = new Date();

  const [poems, essays, research] = await Promise.all([
    prisma.poem.findMany({
      where: { publishedAt: { lte: now } },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
    }),
    prisma.essay.findMany({
      where: { publishedAt: { lte: now } },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
    }),
    prisma.researchPaper.findMany({
      where: { publishedAt: { lte: now } },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { title: true, slug: true, abstract: true, publishedAt: true },
    }),
  ]);

  const items = [
    ...poems.map((p) => ({
      title: p.title,
      link: `${SITE_URL}/en/poetry/${p.slug}`,
      description: p.excerpt ?? "",
      pubDate: p.publishedAt!.toUTCString(),
      category: "Poetry",
    })),
    ...essays.map((e) => ({
      title: e.title,
      link: `${SITE_URL}/en/essays/${e.slug}`,
      description: e.excerpt ?? "",
      pubDate: e.publishedAt!.toUTCString(),
      category: "Essays",
    })),
    ...research.map((r) => ({
      title: r.title,
      link: `${SITE_URL}/en/research/${r.slug}`,
      description: r.abstract ?? "",
      pubDate: r.publishedAt!.toUTCString(),
      category: "Research",
    })),
  ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return rssResponse(
    buildRssFeed(items, {
      title: "Selenarium",
      description: "Poetry, photography, music, and research from the Selenarium.",
      feedPath: "/feed.xml",
    })
  );
}
