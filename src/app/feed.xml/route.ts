import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";

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

  type FeedItem = { title: string; link: string; description: string; pubDate: string; category: string };

  const items: FeedItem[] = [
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

  const escXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Selenarium</title>
  <link>${SITE_URL}</link>
  <description>Poetry, photography, music, and research from the Selenarium.</description>
  <language>en</language>
  <lastBuildDate>${now.toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `  <item>
    <title>${escXml(item.title)}</title>
    <link>${item.link}</link>
    <guid isPermaLink="true">${item.link}</guid>
    <description>${escXml(item.description)}</description>
    <pubDate>${item.pubDate}</pubDate>
    <category>${item.category}</category>
  </item>`
  )
  .join("\n")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
