import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the module under test
vi.mock("@/lib/prisma", () => ({
  prisma: {
    siteSetting: {
      findMany: vi.fn(),
    },
  },
}));

import { getSiteConfig, SITE_URL } from "../site-config";
import { prisma } from "@/lib/prisma";

const mockFindMany = prisma.siteSetting.findMany as ReturnType<typeof vi.fn>;

describe("getSiteConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when no settings exist in DB", async () => {
    mockFindMany.mockResolvedValue([]);

    const config = await getSiteConfig();

    expect(config.siteName).toBe("Selenarium");
    expect(config.authorName).toBe("Mihai Gavrilescu");
    expect(config.authorHandle).toBe("@lemagepoet");
    expect(config.siteUrl).toBe(SITE_URL);
  });

  it("overrides defaults with DB values", async () => {
    mockFindMany.mockResolvedValue([
      { key: "siteName", value: "My Custom Site" },
      { key: "authorName", value: "Jane Doe" },
    ]);

    const config = await getSiteConfig();

    expect(config.siteName).toBe("My Custom Site");
    expect(config.authorName).toBe("Jane Doe");
    // Non-overridden keys still use defaults
    expect(config.authorHandle).toBe("@lemagepoet");
  });

  it("queries prisma with the correct keys", async () => {
    mockFindMany.mockResolvedValue([]);

    await getSiteConfig();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        key: {
          in: expect.arrayContaining([
            "siteName",
            "authorName",
            "contactEmail",
          ]),
        },
      },
    });
  });
});
