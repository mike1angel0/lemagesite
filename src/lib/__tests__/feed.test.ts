import { describe, it, expect } from "vitest";
import { buildRssFeed } from "@/lib/feed";

describe("buildRssFeed", () => {
  it("generates valid RSS XML with items", () => {
    const items = [
      {
        title: "Test Poem",
        link: "https://example.com/poetry/test",
        description: "A test poem",
        pubDate: new Date("2026-01-01").toUTCString(),
        category: "Poetry",
      },
    ];

    const xml = buildRssFeed(items, {
      title: "Test Feed",
      description: "Test description",
      feedPath: "/feed/test.xml",
    });

    expect(xml).toContain("<?xml version");
    expect(xml).toContain("<title>Test Feed</title>");
    expect(xml).toContain("<title>Test Poem</title>");
    expect(xml).toContain("<category>Poetry</category>");
    expect(xml).toContain("https://example.com/poetry/test");
  });

  it("escapes XML entities in content", () => {
    const items = [
      {
        title: 'Poem & "Quotes"',
        link: "https://example.com/test",
        description: "Has <special> chars",
        pubDate: new Date().toUTCString(),
        category: "Poetry",
      },
    ];

    const xml = buildRssFeed(items, {
      title: "Feed",
      description: "Desc",
      feedPath: "/feed.xml",
    });

    expect(xml).toContain("Poem &amp; &quot;Quotes&quot;");
    expect(xml).toContain("Has &lt;special&gt; chars");
  });

  it("generates valid XML with empty items array", () => {
    const xml = buildRssFeed([], {
      title: "Empty Feed",
      description: "No items",
      feedPath: "/feed/empty.xml",
    });

    expect(xml).toContain("<title>Empty Feed</title>");
    expect(xml).not.toContain("<item>");
  });
});
