import { prisma } from "@/lib/prisma";
import { PLACEHOLDER } from "@/lib/placeholders";
import { unstable_cache } from "next/cache";

// ──────────────────────────────────────────────
// Caching helpers
// ──────────────────────────────────────────────

const CACHE_SHORT = 60; // 1 minute
const CACHE_MEDIUM = 300; // 5 minutes
const CACHE_LONG = 3600; // 1 hour

// ──────────────────────────────────────────────
// Page Content (DB overrides for hero sections)
// ──────────────────────────────────────────────

export async function getPageContent(
  namespace: string,
  keys: string[],
  locale: string,
  t: (key: string) => string
): Promise<Record<string, string>> {
  const dbKeys = keys.map((k) => `${locale}:${namespace}.${k}`);
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: dbKeys } },
  });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const result: Record<string, string> = {};
  for (const k of keys) {
    result[k] = map.get(`${locale}:${namespace}.${k}`) || t(k);
  }
  return result;
}

// ──────────────────────────────────────────────
// Social Links (for footer)
// ──────────────────────────────────────────────

const SOCIAL_KEYS = [
  "instagram", "youtube", "tiktok", "facebook", "twitter", "bluesky",
  "threads", "mastodon", "medium", "substack", "spotify", "soundcloud",
  "bandcamp", "appleMusic", "github", "linkedin", "pinterest", "tumblr",
  "patreon", "kofi", "discord", "telegram", "whatsapp", "vimeo", "twitch",
  "behance", "dribbble", "flickr", "goodreads", "website",
];

export const getSocialLinks = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: SOCIAL_KEYS } },
    });
    const result: Record<string, string> = {};
    for (const s of settings) {
      if (s.value) result[s.key] = s.value;
    }
    return result;
  },
  ["social-links"],
  { revalidate: CACHE_LONG }
);

// ──────────────────────────────────────────────
// About Content (from admin About editor)
// ──────────────────────────────────────────────

export const getAboutContent = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "about_" } },
    });
    const result: Record<string, string> = {};
    for (const s of settings) {
      if (s.value) result[s.key] = s.value;
    }
    return result;
  },
  ["about-content"],
  { revalidate: CACHE_MEDIUM }
);

// ──────────────────────────────────────────────
// Poetry
// ──────────────────────────────────────────────

export async function getPublishedPoems(collection?: string) {
  return prisma.poem.findMany({
    where: {
      publishedAt: { lte: new Date() },
      ...(collection ? { collection } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPoemBySlug(slug: string) {
  // Try English slug first, then Romanian slug
  const poem = await prisma.poem.findUnique({ where: { slug } });
  if (poem) return poem;
  return prisma.poem.findFirst({ where: { slugRo: slug } });
}

// ──────────────────────────────────────────────
// Photography
// ──────────────────────────────────────────────

export async function getPublishedPhotos(seriesSlug?: string) {
  return prisma.photo.findMany({
    where: {
      publishedAt: { lte: new Date() },
      ...(seriesSlug ? { series: { slug: seriesSlug } } : {}),
    },
    include: { series: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPhotoBySlug(slug: string) {
  return prisma.photo.findUnique({
    where: { slug },
    include: { series: true },
  });
}

export async function getPhotoSeries() {
  return prisma.photoSeries.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.photoSeries.findUnique({
    where: { slug },
    include: { photos: { where: { publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" } } },
  });
}

// ──────────────────────────────────────────────
// Essays
// ──────────────────────────────────────────────

export async function getPublishedEssays() {
  return prisma.essay.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getEssayBySlug(slug: string) {
  return prisma.essay.findUnique({ where: { slug } });
}

// ──────────────────────────────────────────────
// Research
// ──────────────────────────────────────────────

export async function getPublishedResearch() {
  return prisma.researchPaper.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getResearchBySlug(slug: string) {
  return prisma.researchPaper.findUnique({ where: { slug } });
}

// ──────────────────────────────────────────────
// Books
// ──────────────────────────────────────────────

export async function getPublishedBooks() {
  return prisma.book.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBookBySlug(slug: string) {
  return prisma.book.findUnique({ where: { slug } });
}

// ──────────────────────────────────────────────
// Music
// ──────────────────────────────────────────────

export async function getAlbumsWithTracks() {
  return prisma.album.findMany({
    include: { tracks: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAlbumBySlug(slug: string) {
  return prisma.album.findUnique({
    where: { slug },
    include: { tracks: { orderBy: { order: "asc" } } },
  });
}

// ──────────────────────────────────────────────
// Events
// ──────────────────────────────────────────────

export async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });
}

export async function getPastEvents() {
  return prisma.event.findMany({
    where: { date: { lt: new Date() } },
    orderBy: { date: "desc" },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({ where: { slug } });
}

// ──────────────────────────────────────────────
// Shop
// ──────────────────────────────────────────────

export async function getPublishedProducts(category?: string) {
  return prisma.product.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: category ? { category: category as any } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

// ──────────────────────────────────────────────
// Homepage / Featured
// ──────────────────────────────────────────────

export const getFeaturedContent = unstable_cache(
  async () => {
    const now = new Date();
    const [latestPoem, latestEssay, latestPhoto, latestResearch] =
      await Promise.all([
        prisma.poem.findFirst({
          where: { publishedAt: { lte: now } },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.essay.findFirst({
          where: { publishedAt: { lte: now } },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.photo.findFirst({
          where: { publishedAt: { lte: now } },
          include: { series: true },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.researchPaper.findFirst({
          where: { publishedAt: { lte: now } },
          orderBy: { publishedAt: "desc" },
        }),
      ]);

    return { latestPoem, latestEssay, latestPhoto, latestResearch };
  },
  ["featured-content"],
  { revalidate: CACHE_SHORT }
);

export const getPartners = unstable_cache(
  async () => {
    return prisma.partner.findMany({ orderBy: { createdAt: "asc" } });
  },
  ["partners"],
  { revalidate: CACHE_LONG }
);

export async function getRandomQuote() {
  const count = await prisma.quote.count();
  if (count === 0) return null;
  const skip = Math.floor(Math.random() * count);
  const quotes = await prisma.quote.findMany({ take: 1, skip });
  return quotes[0] ?? null;
}

// ──────────────────────────────────────────────
// Related Content (tag-based)
// ──────────────────────────────────────────────

export async function getRelatedEssays(slug: string, category: string | null, limit = 3) {
  if (category) {
    const tags = category.split(/[,&]/).map((t) => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      const related = await prisma.essay.findMany({
        where: {
          slug: { not: slug },
          publishedAt: { lte: new Date() },
          OR: tags.map((tag) => ({ category: { contains: tag, mode: "insensitive" as const } })),
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
      });
      if (related.length > 0) return related;
    }
  }
  // Fallback: latest essays excluding current
  return prisma.essay.findMany({
    where: { slug: { not: slug }, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getRelatedResearch(slug: string, tags: string[], limit = 3) {
  if (tags.length > 0) {
    const related = await prisma.researchPaper.findMany({
      where: {
        slug: { not: slug },
        publishedAt: { lte: new Date() },
        tags: { hasSome: tags },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    if (related.length > 0) return related;
  }
  // Fallback: latest papers excluding current
  return prisma.researchPaper.findMany({
    where: { slug: { not: slug }, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getRelatedPoems(slug: string, collection: string | null, limit = 3) {
  if (collection) {
    const related = await prisma.poem.findMany({
      where: {
        slug: { not: slug },
        publishedAt: { lte: new Date() },
        collection,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    if (related.length > 0) return related;
  }
  // Fallback: latest poems excluding current
  return prisma.poem.findMany({
    where: { slug: { not: slug }, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// ──────────────────────────────────────────────
// Search
// ──────────────────────────────────────────────

export async function searchContent(query: string, page = 1, pageSize = 20) {
  if (!query.trim()) return { results: [], total: 0, page: 1 };

  const q = query.trim();

  const [poems, essays, research, books, photos] = await Promise.all([
    prisma.poem.findMany({
      where: {
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, excerpt: true },
    }),
    prisma.essay.findMany({
      where: {
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, excerpt: true },
    }),
    prisma.researchPaper.findMany({
      where: {
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { abstract: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, abstract: true },
    }),
    prisma.book.findMany({
      where: {
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, description: true },
    }),
    prisma.photo.findMany({
      where: {
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, description: true },
    }),
  ]);

  const qLower = q.toLowerCase();

  const allResults = [
    ...poems.map((p) => ({
      category: "POETRY" as const,
      icon: "feather" as const,
      title: p.title,
      description: p.excerpt ?? "",
      href: `/poetry/${p.slug}`,
      titleMatch: p.title.toLowerCase().includes(qLower),
    })),
    ...essays.map((e) => ({
      category: "ESSAY" as const,
      icon: "essay" as const,
      title: e.title,
      description: e.excerpt ?? "",
      href: `/essays/${e.slug}`,
      titleMatch: e.title.toLowerCase().includes(qLower),
    })),
    ...research.map((r) => ({
      category: "RESEARCH" as const,
      icon: "research" as const,
      title: r.title,
      description: r.abstract ?? "",
      href: `/research/${r.slug}`,
      titleMatch: r.title.toLowerCase().includes(qLower),
    })),
    ...books.map((b) => ({
      category: "BOOK" as const,
      icon: "book" as const,
      title: b.title,
      description: b.description ?? "",
      href: `/books/${b.slug}`,
      titleMatch: b.title.toLowerCase().includes(qLower),
    })),
    ...photos.map((p) => ({
      category: "PHOTOGRAPHY" as const,
      icon: "feather" as const,
      title: p.title,
      description: p.description ?? "",
      href: `/photography/${p.slug}`,
      titleMatch: p.title.toLowerCase().includes(qLower),
    })),
  ];

  // Sort: title matches first
  allResults.sort((a, b) => (a.titleMatch === b.titleMatch ? 0 : a.titleMatch ? -1 : 1));

  const total = allResults.length;
  const start = (page - 1) * pageSize;
  const results = allResults.slice(start, start + pageSize).map(({ titleMatch: _, ...rest }) => rest);

  return { results, total, page };
}

// ──────────────────────────────────────────────
// Site Images (admin-uploaded hero/portrait)
// ──────────────────────────────────────────────

export const getSiteImages = unstable_cache(
  async () => {
    const keys = ["heroImage", "portraitImage", "ogDefaultImage"];
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      hero: map.get("heroImage") || PLACEHOLDER.generic,
      portrait: map.get("portraitImage") || PLACEHOLDER.portrait,
      ogDefault: map.get("ogDefaultImage") || "/og-default.jpg",
    };
  },
  ["site-images"],
  { revalidate: CACHE_MEDIUM }
);
