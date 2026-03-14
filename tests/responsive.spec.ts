import { test, expect } from "@playwright/test";

const LOCALE = "en";
const BASE = `/${LOCALE}`;

/**
 * Responsive layout tests.
 *
 * Checks for common responsive issues across mobile, tablet, and desktop:
 * - No horizontal overflow / scrollbar
 * - No content clipped or overflowing viewport
 * - Touch targets meet minimum size (44x44px) on mobile
 * - Navigation adapts correctly per viewport
 */

// Key public pages to test (covers different layout patterns)
const publicRoutes = [
  "/",
  "/poetry",
  "/photography",
  "/music",
  "/books",
  "/research",
  "/essays",
  "/membership",
  "/about",
  "/contact",
  "/events",
  "/shop",
  "/login",
  "/signup",
];

// --- Horizontal overflow detection ---
for (const route of publicRoutes) {
  test(`no horizontal overflow on ${route}`, async ({ page }) => {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(
      hasOverflow,
      `Page ${route} has horizontal overflow (scrollWidth > clientWidth)`,
    ).toBe(false);
  });
}

// --- Navigation adapts to viewport ---
test.describe("Navigation responsiveness", () => {
  test("mobile: hamburger menu is visible, desktop nav is hidden", async ({
    page,
    browserName,
  }) => {
    const isMobile = test.info().project.name.startsWith("mobile");
    test.skip(!isMobile, "Only runs on mobile viewports");

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    const hamburger = page.locator('button[aria-label="Open menu"]');
    await expect(hamburger).toBeVisible();
  });

  test("desktop: nav links are visible, no hamburger", async ({ page }) => {
    const isDesktop = test.info().project.name === "chromium";
    test.skip(!isDesktop, "Only runs on desktop viewport");

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Poetry" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Music" })).toBeVisible();
  });

  test("tablet: page loads and navigation is accessible", async ({ page }) => {
    const isTablet = test.info().project.name === "tablet";
    test.skip(!isTablet, "Only runs on tablet viewport");

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    // On tablet, either desktop nav or hamburger should be visible
    const hamburger = page.locator('button[aria-label="Open menu"]');
    const desktopNav = page.locator("header nav").getByRole("link", { name: "Poetry" });

    const hamburgerVisible = await hamburger.isVisible().catch(() => false);
    const navVisible = await desktopNav.isVisible().catch(() => false);

    expect(
      hamburgerVisible || navVisible,
      "Neither hamburger menu nor desktop nav links are visible on tablet",
    ).toBe(true);
  });
});

// --- Touch target size (mobile only) ---
test.describe("Touch targets", () => {
  test("interactive elements meet minimum touch target size", async ({ page }) => {
    const isMobile = test.info().project.name.startsWith("mobile");
    test.skip(!isMobile, "Only runs on mobile viewports");

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const smallTargets = await page.evaluate(() => {
      const MIN_SIZE = 44;
      const results: string[] = [];

      const interactiveElements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [role="button"]',
      );

      for (const el of interactiveElements) {
        // Skip hidden elements
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
          continue;
        }

        // Skip elements outside viewport
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

        // Skip inline links within text paragraphs (they flow with text)
        if (
          el.tagName === "A" &&
          el.parentElement?.tagName === "P"
        ) {
          continue;
        }

        // Skip very small icon-only elements that are part of larger clickable areas
        if (el.closest('a[href]') && el !== el.closest('a[href]')) continue;
        if (el.closest('button') && el !== el.closest('button')) continue;

        if (rect.width < MIN_SIZE && rect.height < MIN_SIZE) {
          const tag = el.tagName.toLowerCase();
          const text = el.textContent?.trim().substring(0, 40) || "(empty)";
          results.push(
            `<${tag}> "${text}" (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
          );
        }
      }

      return results;
    });

    if (smallTargets.length > 0) {
      const report = smallTargets.map((t, i) => `  ${i + 1}. ${t}`).join("\n");
      // Warn but don't fail — some small targets are acceptable
      console.warn(
        `Found ${smallTargets.length} small touch target(s) on homepage:\n${report}`,
      );
    }

    // Fail only if more than 5 small targets (threshold for systemic issue)
    expect(
      smallTargets.length,
      `Too many small touch targets (${smallTargets.length}). Fix the most critical ones.`,
    ).toBeLessThanOrEqual(5);
  });
});

// --- Images and media don't overflow ---
test.describe("Media responsiveness", () => {
  for (const route of ["/", "/photography", "/music", "/about"]) {
    test(`images don't overflow viewport on ${route}`, async ({ page }) => {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      const overflowingImages = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const results: string[] = [];

        const images = document.querySelectorAll("img");
        for (const img of images) {
          const rect = img.getBoundingClientRect();
          if (rect.right > viewportWidth + 1) {
            const src = img.src.substring(0, 60);
            results.push(
              `img (${Math.round(rect.width)}px wide) overflows by ${Math.round(rect.right - viewportWidth)}px — ${src}`,
            );
          }
        }

        return results;
      });

      expect(
        overflowingImages,
        `Images overflow viewport on ${route}:\n${overflowingImages.join("\n")}`,
      ).toEqual([]);
    });
  }
});

// --- Text readability (font size not too small on mobile) ---
test.describe("Text readability", () => {
  test("body text is at least 14px on mobile", async ({ page }) => {
    const isMobile = test.info().project.name.startsWith("mobile");
    test.skip(!isMobile, "Only runs on mobile viewports");

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    const tinyText = await page.evaluate(() => {
      const MIN_FONT_SIZE = 14;
      const results: string[] = [];

      // Check paragraph and list text
      const textElements = document.querySelectorAll("p, li, span, td");
      for (const el of textElements) {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;

        const fontSize = parseFloat(style.fontSize);
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Only flag if the element has substantial text
        const text = el.textContent?.trim() || "";
        if (text.length < 10) continue;

        if (fontSize < MIN_FONT_SIZE) {
          results.push(
            `${el.tagName.toLowerCase()} (${fontSize}px): "${text.substring(0, 40)}..."`,
          );
        }
      }

      return results;
    });

    if (tinyText.length > 0) {
      console.warn(
        `Found ${tinyText.length} text element(s) smaller than 14px:\n${tinyText.map((t, i) => `  ${i + 1}. ${t}`).join("\n")}`,
      );
    }

    // Warn threshold — some small text is acceptable (labels, captions)
    expect(
      tinyText.length,
      `Too many tiny text elements (${tinyText.length})`,
    ).toBeLessThanOrEqual(10);
  });
});
