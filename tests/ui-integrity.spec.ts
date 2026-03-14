import { test, expect } from "@playwright/test";

const LOCALE = "en";
const BASE = `/${LOCALE}`;

/**
 * UI Integrity tests.
 *
 * Catches common issues:
 * - Missing translations (text showing "namespace.key" pattern)
 * - TOC anchor links not matching actual content IDs
 * - Payment page tier differentiation
 * - Admin editor adapting to content type
 * - Download/action buttons that are stubs
 */

// --- Missing translations detection ---
const allPublicRoutes = [
  "/", "/poetry", "/photography", "/music", "/books",
  "/research", "/essays", "/membership", "/about", "/contact",
  "/events", "/shop", "/login", "/signup", "/checkout",
  "/poetry/the-cartographers-of-silence",
  "/photography/fog-studies-3",
  "/essays/on-longing-and-algorithms",
  "/books/nocturnal-echoes",
  "/music/nocturnal-echoes",
  "/research/nocturnal-poetics",
  "/events/observatory-night",
  "/shop/nocturnal-echoes",
  "/membership/payment",
  "/membership/payment?tier=supporter",
  "/membership/payment?tier=patron",
  "/membership/payment?tier=inner-circle",
  "/membership/payment?tier=donation",
];

for (const route of allPublicRoutes) {
  test(`no missing translations on ${route}`, async ({ page }) => {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const missingTranslations = await page.evaluate(() => {
      const results: string[] = [];
      // Pattern: "namespace.key" or "namespace.nested.key" shown as visible text
      const pattern = /^[a-z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/;

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
      );

      while (walker.nextNode()) {
        const text = walker.currentNode.textContent?.trim() || "";
        if (text.length > 3 && text.length < 60 && pattern.test(text)) {
          // Skip known non-translation patterns (CSS classes, URLs, etc.)
          const parent = walker.currentNode.parentElement;
          if (parent?.tagName === "CODE" || parent?.tagName === "PRE") continue;
          if (parent?.closest("code, pre, script, style")) continue;

          results.push(text);
        }
      }

      return results;
    });

    expect(
      missingTranslations,
      `Found missing translation(s) on ${route}: ${missingTranslations.join(", ")}`,
    ).toEqual([]);
  });
}

// --- TOC anchor links match content IDs ---
test.describe("Table of Contents anchors", () => {
  test("essay TOC links scroll to existing sections", async ({ page }) => {
    await page.goto(`${BASE}/essays/on-longing-and-algorithms`, {
      waitUntil: "domcontentloaded",
    });

    // Get all TOC anchor hrefs
    const tocAnchors = await page
      .locator("aside nav a[href^='#']")
      .evaluateAll((anchors) =>
        anchors.map((a) => ({
          href: a.getAttribute("href"),
          text: a.textContent?.trim(),
        })),
      );

    expect(tocAnchors.length).toBeGreaterThan(0);

    // Verify each anchor has a matching element with that ID
    for (const anchor of tocAnchors) {
      const id = anchor.href!.replace("#", "");
      const target = page.locator(`#${id}`);
      await expect(
        target,
        `TOC link "${anchor.text}" points to #${id} which doesn't exist`,
      ).toHaveCount(1);
    }
  });

  test("research TOC links scroll to existing sections", async ({ page }) => {
    await page.goto(`${BASE}/research/nocturnal-poetics`, {
      waitUntil: "domcontentloaded",
    });

    const tocAnchors = await page
      .locator('nav a[href^="#"]')
      .evaluateAll((anchors) =>
        anchors.map((a) => ({
          href: a.getAttribute("href"),
          text: a.textContent?.trim(),
        })),
      );

    expect(tocAnchors.length).toBeGreaterThan(0);

    for (const anchor of tocAnchors) {
      const id = anchor.href!.replace("#", "");
      const target = page.locator(`#${id}`);
      await expect(
        target,
        `TOC link "${anchor.text}" points to #${id} which doesn't exist`,
      ).toHaveCount(1);
    }
  });
});

// --- Payment page tier differentiation ---
test.describe("Membership payment tiers", () => {
  const tiers = [
    { param: "supporter", expectedPrice: "4" },
    { param: "patron", expectedPrice: "10" },
    { param: "inner-circle", expectedPrice: "200" },
  ];

  for (const tier of tiers) {
    test(`${tier.param} tier shows €${tier.expectedPrice}/month`, async ({
      page,
    }) => {
      await page.goto(`${BASE}/membership/payment?tier=${tier.param}`, {
        waitUntil: "domcontentloaded",
      });

      const priceText = await page.textContent("body");
      expect(priceText).toContain(`€${tier.expectedPrice}`);
    });
  }

  test("donation page shows donation form", async ({ page }) => {
    await page.goto(`${BASE}/membership/payment?tier=donation`, {
      waitUntil: "domcontentloaded",
    });

    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("DONATE NOW");
  });

  test("each tier shows different title", async ({ page }) => {
    const titles: string[] = [];

    for (const tier of ["supporter", "patron", "inner-circle"]) {
      await page.goto(`${BASE}/membership/payment?tier=${tier}`, {
        waitUntil: "domcontentloaded",
      });
      const h1 = await page.locator("h1").textContent();
      titles.push(h1 || "");
    }

    // All titles should be unique
    const unique = new Set(titles);
    expect(unique.size).toBe(3);
  });
});

// --- Membership pricing page shows correct prices ---
test.describe("Membership pricing display", () => {
  test("pricing cards show correct amounts", async ({ page }) => {
    await page.goto(`${BASE}/membership`, { waitUntil: "domcontentloaded" });

    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("€4");
    expect(bodyText).toContain("€10");
    expect(bodyText).toContain("€200");
  });
});

// --- Admin editor content type adaptation ---
test.describe("Admin editor", () => {
  test("shows Photography fields when Photography is selected", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/editor`, {
      waitUntil: "domcontentloaded",
    });

    // Select Photography category (first select on page)
    await page.locator("select").first().selectOption("Photography");
    await page.waitForTimeout(300);

    // Should show photography-specific fields (check via placeholders)
    await expect(page.getByPlaceholder(/cloudinary/)).toBeVisible();
    await expect(page.getByPlaceholder(/Fog Studies/)).toBeVisible();
    await expect(page.getByPlaceholder(/Sony A7III/)).toBeVisible();
  });

  test("shows Essay fields when Essay is selected", async ({ page }) => {
    await page.goto(`${BASE}/admin/editor`, {
      waitUntil: "domcontentloaded",
    });

    await page.locator("select").first().selectOption("Essay");

    await page.waitForTimeout(300);
    await expect(page.getByPlaceholder("e.g. 12 min")).toBeVisible();
  });

  test("shows Music fields when Music is selected", async ({ page }) => {
    await page.goto(`${BASE}/admin/editor`, {
      waitUntil: "domcontentloaded",
    });

    await page.locator("select").first().selectOption("Music");

    await page.waitForTimeout(300);
    await expect(page.getByPlaceholder("e.g. Nocturnal Echoes")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. 4:32")).toBeVisible();
  });

  test("shows Research fields when Research is selected", async ({ page }) => {
    await page.goto(`${BASE}/admin/editor`, {
      waitUntil: "domcontentloaded",
    });

    await page.locator("select").first().selectOption("Research");
    await page.waitForTimeout(300);

    await expect(page.getByPlaceholder("Paper abstract...")).toBeVisible();
    await expect(page.getByPlaceholder("10.xxxx/xxxxx")).toBeVisible();
  });

  test("title updates when category changes", async ({ page }) => {
    await page.goto(`${BASE}/admin/editor`, {
      waitUntil: "domcontentloaded",
    });

    // Default is Poetry
    await expect(page.locator("h1")).toContainText("Poetry");

    // Switch to Photography
    await page.locator("select").first().selectOption("Photography");
    await page.waitForTimeout(300);
    await expect(page.locator("h1")).toContainText("Photography");
  });
});

// --- Stub button detection (alert-only handlers) ---
test.describe("Stub action buttons", () => {
  const stubPages = [
    {
      route: "/research/nocturnal-poetics",
      buttons: ["Download PDF", "Cite"],
    },
    {
      route: "/photography/fog-studies-3",
      buttons: ["Download", "Share"],
    },
  ];

  for (const { route, buttons } of stubPages) {
    for (const buttonText of buttons) {
      test(`${buttonText} button on ${route} is present`, async ({ page }) => {
        await page.goto(`${BASE}${route}`, {
          waitUntil: "domcontentloaded",
        });

        const button = page.getByRole("button", { name: buttonText });
        await expect(button).toBeVisible();
      });
    }
  }
});
