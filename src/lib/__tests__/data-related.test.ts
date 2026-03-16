import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    essay: { findMany: vi.fn().mockResolvedValue([]) },
    researchPaper: { findMany: vi.fn().mockResolvedValue([]) },
    poem: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { prisma } from "@/lib/prisma";
import { getRelatedEssays, getRelatedResearch, getRelatedPoems } from "@/lib/data";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getRelatedEssays", () => {
  it("searches by category tags when category is provided", async () => {
    (prisma.essay.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { title: "Related", slug: "related", category: "AI" },
    ]);

    const result = await getRelatedEssays("current-slug", "AI & Philosophy");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Related");
  });

  it("falls back to date-based when no category matches", async () => {
    (prisma.essay.findMany as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]) // tag search returns nothing
      .mockResolvedValueOnce([{ title: "Fallback", slug: "fallback" }]);

    const result = await getRelatedEssays("current-slug", "Nonexistent");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Fallback");
  });

  it("falls back when category is null", async () => {
    (prisma.essay.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { title: "Latest", slug: "latest" },
    ]);

    const result = await getRelatedEssays("current-slug", null);
    expect(result).toHaveLength(1);
  });
});

describe("getRelatedResearch", () => {
  it("searches by tags using hasSome", async () => {
    (prisma.researchPaper.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { title: "Match", slug: "match", tags: ["NLP"] },
    ]);

    const result = await getRelatedResearch("current-slug", ["NLP", "AI"]);
    expect(result).toHaveLength(1);
  });

  it("falls back when tags is empty", async () => {
    (prisma.researchPaper.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { title: "Fallback", slug: "fallback" },
    ]);

    const result = await getRelatedResearch("current-slug", []);
    expect(result).toHaveLength(1);
  });
});

describe("getRelatedPoems", () => {
  it("searches by collection", async () => {
    (prisma.poem.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { title: "Same Collection", slug: "same-collection", collection: "Silence" },
    ]);

    const result = await getRelatedPoems("current-slug", "Silence");
    expect(result).toHaveLength(1);
  });

  it("falls back when collection is null", async () => {
    (prisma.poem.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { title: "Latest", slug: "latest" },
    ]);

    const result = await getRelatedPoems("current-slug", null);
    expect(result).toHaveLength(1);
  });
});
