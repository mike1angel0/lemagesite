import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import { buildRssFeed, rssResponse } from "@/lib/feed";

export async function GET() {
  const papers = await prisma.researchPaper.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { title: true, slug: true, abstract: true, publishedAt: true },
  });

  const items = papers.map((r) => ({
    title: r.title,
    link: `${SITE_URL}/en/research/${r.slug}`,
    description: r.abstract ?? "",
    pubDate: r.publishedAt!.toUTCString(),
    category: "Research",
  }));

  return rssResponse(
    buildRssFeed(items, {
      title: "Selenarium — Research",
      description: "Research papers from the Selenarium",
      feedPath: "/feed/research.xml",
    })
  );
}
