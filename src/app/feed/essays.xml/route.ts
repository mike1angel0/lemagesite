import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import { buildRssFeed, rssResponse } from "@/lib/feed";

export async function GET() {
  const essays = await prisma.essay.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { title: true, slug: true, excerpt: true, publishedAt: true },
  });

  const items = essays.map((e) => ({
    title: e.title,
    link: `${SITE_URL}/en/essays/${e.slug}`,
    description: e.excerpt ?? "",
    pubDate: e.publishedAt!.toUTCString(),
    category: "Essays",
  }));

  return rssResponse(
    buildRssFeed(items, {
      title: "Selenarium — Essays",
      description: "Essays from the Selenarium",
      feedPath: "/feed/essays.xml",
    })
  );
}
