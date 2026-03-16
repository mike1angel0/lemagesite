import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock unstable_cache to just pass through the function
vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    siteSetting: { findMany: vi.fn() },
    poem: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    photo: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
    photoSeries: { findMany: vi.fn(), findUnique: vi.fn() },
    essay: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
    researchPaper: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
    book: { findMany: vi.fn(), findUnique: vi.fn() },
    album: { findMany: vi.fn(), findUnique: vi.fn() },
    event: { findMany: vi.fn(), findUnique: vi.fn() },
    product: { findMany: vi.fn(), findUnique: vi.fn() },
    partner: { findMany: vi.fn() },
    quote: { count: vi.fn(), findMany: vi.fn() },
  },
}));

import {
  getPageContent,
  getSocialLinks,
  getAboutContent,
  getPublishedPoems,
  getPoemBySlug,
  searchContent,
  getRandomQuote,
} from "../data";
import { prisma } from "@/lib/prisma";

describe("data helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPageContent", () => {
    it("returns DB values when available, falls back to translations", async () => {
      (prisma.siteSetting.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { key: "en:home.heroTitle", value: "Custom Title" },
      ]);

      const t = (key: string) => `default_${key}`;
      const result = await getPageContent("home", ["heroTitle", "heroSubtitle"], "en", t);

      expect(result.heroTitle).toBe("Custom Title");
      expect(result.heroSubtitle).toBe("default_heroSubtitle");
    });
  });

  describe("getSocialLinks", () => {
    it("returns only non-empty social links", async () => {
      (prisma.siteSetting.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { key: "instagram", value: "https://instagram.com/test" },
        { key: "youtube", value: "" },
        { key: "twitter", value: "https://twitter.com/test" },
      ]);

      const result = await getSocialLinks();

      expect(result.instagram).toBe("https://instagram.com/test");
      expect(result.twitter).toBe("https://twitter.com/test");
      expect(result.youtube).toBeUndefined();
    });
  });

  describe("getAboutContent", () => {
    it("returns about_ prefixed settings", async () => {
      (prisma.siteSetting.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { key: "about_displayName", value: "Test Name" },
        { key: "about_bio", value: "Some bio" },
      ]);

      const result = await getAboutContent();

      expect(result.about_displayName).toBe("Test Name");
      expect(result.about_bio).toBe("Some bio");
    });
  });

  describe("getPublishedPoems", () => {
    it("fetches published poems ordered by date desc", async () => {
      (prisma.poem.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await getPublishedPoems();

      expect(prisma.poem.findMany).toHaveBeenCalledWith({
        where: { publishedAt: { lte: expect.any(Date) } },
        orderBy: { publishedAt: "desc" },
      });
    });

    it("filters by collection when provided", async () => {
      (prisma.poem.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await getPublishedPoems("nocturnal");

      expect(prisma.poem.findMany).toHaveBeenCalledWith({
        where: {
          publishedAt: { lte: expect.any(Date) },
          collection: "nocturnal",
        },
        orderBy: { publishedAt: "desc" },
      });
    });
  });

  describe("getPoemBySlug", () => {
    it("queries by slug", async () => {
      (prisma.poem.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "test-poem" });

      const result = await getPoemBySlug("test-poem");

      expect(prisma.poem.findUnique).toHaveBeenCalledWith({ where: { slug: "test-poem" } });
      expect(result?.slug).toBe("test-poem");
    });
  });

  describe("getRandomQuote", () => {
    it("returns null when no quotes exist", async () => {
      (prisma.quote.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      const result = await getRandomQuote();

      expect(result).toBeNull();
      expect(prisma.quote.findMany).not.toHaveBeenCalled();
    });

    it("returns a quote when quotes exist", async () => {
      (prisma.quote.count as ReturnType<typeof vi.fn>).mockResolvedValue(3);
      (prisma.quote.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "1", text: "Test quote", author: "Author" },
      ]);

      const result = await getRandomQuote();

      expect(result).not.toBeNull();
      expect(result?.text).toBe("Test quote");
    });
  });

  describe("searchContent", () => {
    it("returns empty array for empty query", async () => {
      const result = await searchContent("");
      expect(result).toEqual([]);
    });

    it("returns empty array for whitespace query", async () => {
      const result = await searchContent("   ");
      expect(result).toEqual([]);
    });

    it("maps results with correct categories and hrefs", async () => {
      (prisma.poem.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { title: "Night Poem", slug: "night-poem", excerpt: "A dark poem" },
      ]);
      (prisma.essay.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.researchPaper.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.book.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await searchContent("night");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        category: "POETRY",
        icon: "feather",
        title: "Night Poem",
        description: "A dark poem",
        href: "/poetry/night-poem",
      });
    });
  });
});
