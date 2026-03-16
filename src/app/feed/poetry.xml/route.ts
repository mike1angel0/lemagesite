import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import { buildRssFeed, rssResponse } from "@/lib/feed";

export async function GET() {
  const poems = await prisma.poem.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { title: true, slug: true, excerpt: true, publishedAt: true },
  });

  const items = poems.map((p) => ({
    title: p.title,
    link: `${SITE_URL}/en/poetry/${p.slug}`,
    description: p.excerpt ?? "",
    pubDate: p.publishedAt!.toUTCString(),
    category: "Poetry",
  }));

  return rssResponse(
    buildRssFeed(items, {
      title: "Selenarium — Poetry",
      description: "Poems from the Selenarium",
      feedPath: "/feed/poetry.xml",
    })
  );
}
