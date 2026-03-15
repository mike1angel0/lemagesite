import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL || "https://theselenarium.art";
const LOCALES = ["en", "ro"] as const;

function localized(path: string, priority: number, freq: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly", lastMod?: Date): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: lastMod ?? new Date(),
    changeFrequency: freq,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...localized("", 1.0, "daily"),
    ...localized("/poetry", 0.9, "daily"),
    ...localized("/photography", 0.9, "daily"),
    ...localized("/music", 0.8, "weekly"),
    ...localized("/essays", 0.9, "daily"),
    ...localized("/research", 0.7, "weekly"),
    ...localized("/about", 0.6, "monthly"),
    ...localized("/shop", 0.8, "weekly"),
    ...localized("/books", 0.7, "weekly"),
    ...localized("/membership/payment", 0.5, "monthly"),
    ...localized("/contact", 0.4, "monthly"),
  ];

  const [poems, photos, photoSeries, essays, research, albums, books, products, events] =
    await Promise.all([
      prisma.poem.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.photo.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.photoSeries.findMany({
        select: { slug: true, createdAt: true },
      }),
      prisma.essay.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.researchPaper.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.album.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.book.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.product.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.event.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...poems.flatMap((p) => localized(`/poetry/${p.slug}`, 0.7, "monthly", p.updatedAt)),
    ...photos.flatMap((p) => localized(`/photography/${p.slug}`, 0.6, "monthly", p.updatedAt)),
    ...photoSeries.flatMap((s) => localized(`/photography/series/${s.slug}`, 0.7, "monthly", s.createdAt)),
    ...essays.flatMap((e) => localized(`/essays/${e.slug}`, 0.8, "monthly", e.updatedAt)),
    ...research.flatMap((r) => localized(`/research/${r.slug}`, 0.7, "monthly", r.updatedAt)),
    ...albums.flatMap((a) => localized(`/music/${a.slug}`, 0.7, "monthly", a.updatedAt)),
    ...books.flatMap((b) => localized(`/books/${b.slug}`, 0.6, "monthly", b.updatedAt)),
    ...products.flatMap((p) => localized(`/shop/${p.slug}`, 0.6, "weekly", p.updatedAt)),
    ...events.flatMap((e) => localized(`/events/${e.slug}`, 0.5, "weekly", e.updatedAt)),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
