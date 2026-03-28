import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import { buildPodcastFeed, rssResponse } from "@/lib/feed";
import type { PodcastFeedItem } from "@/lib/feed";

export async function GET() {
  const [episodes, imageSetting] = await Promise.all([
    prisma.podcastEpisode.findMany({
      where: { contentType: "ESSAY", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        contentId: true,
        audioUrl: true,
        duration: true,
        coverImage: true,
        publishedAt: true,
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: "podcastEssaysImage" } }),
  ]);

  // Fetch linked essays to use their excerpt as description
  const contentIds = episodes.map((ep) => ep.contentId).filter(Boolean) as string[];
  const essays = contentIds.length
    ? await prisma.essay.findMany({
        where: { id: { in: contentIds } },
        select: { id: true, excerpt: true },
      })
    : [];
  const essayExcerptMap = new Map(essays.map((e) => [e.id, e.excerpt]));

  const imageUrl = imageSetting?.value || `${SITE_URL}/og-default.jpg`;

  const items: PodcastFeedItem[] = episodes.map((ep) => ({
    id: ep.id,
    title: ep.title,
    description: ep.description || (ep.contentId && essayExcerptMap.get(ep.contentId)) || "",
    audioUrl: ep.audioUrl,
    duration: ep.duration,
    pubDate: ep.publishedAt!.toUTCString(),
    coverImage: ep.coverImage,
  }));

  return rssResponse(
    buildPodcastFeed(items, {
      title: "Selenarium Essays",
      description: "Essay readings by Mihai Gavrilescu",
      author: "Mihai Gavrilescu",
      email: "contact@theselenarium.art",
      feedPath: "/feed/podcast/essays.xml",
      imageUrl,
      category: "Society & Culture",
    }),
  );
}
