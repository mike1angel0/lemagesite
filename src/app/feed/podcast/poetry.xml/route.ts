import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import { buildPodcastFeed, rssResponse } from "@/lib/feed";
import type { PodcastFeedItem } from "@/lib/feed";

export async function GET() {
  const [episodes, imageSetting] = await Promise.all([
    prisma.podcastEpisode.findMany({
      where: { contentType: "POEM", publishedAt: { not: null } },
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
    prisma.siteSetting.findUnique({ where: { key: "podcastPoetryImage" } }),
  ]);

  // Fetch linked poems to use their body as description
  const contentIds = episodes.map((ep) => ep.contentId).filter(Boolean) as string[];
  const poems = contentIds.length
    ? await prisma.poem.findMany({
        where: { id: { in: contentIds } },
        select: { id: true, body: true },
      })
    : [];
  const poemBodyMap = new Map(poems.map((p) => [p.id, p.body]));

  const imageUrl = imageSetting?.value || `${SITE_URL}/og-default.jpg`;

  const items: PodcastFeedItem[] = episodes.map((ep) => ({
    id: ep.id,
    title: ep.title,
    description: ep.description || (ep.contentId && poemBodyMap.get(ep.contentId)) || "",
    audioUrl: ep.audioUrl,
    duration: ep.duration,
    pubDate: ep.publishedAt!.toUTCString(),
    coverImage: ep.coverImage,
  }));

  return rssResponse(
    buildPodcastFeed(items, {
      title: "Le Mage Reads",
      description: "Poetry readings by lemagepoet",
      author: "lemagepoet",
      email: "contact@theselenarium.art",
      feedPath: "/feed/podcast/poetry.xml",
      imageUrl,
      category: "Arts",
      subcategory: "Poetry",
    }),
  );
}
