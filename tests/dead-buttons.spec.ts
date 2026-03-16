import { test, expect } from "@playwright/test";

/**
 * Dead-button detection test.
 *
 * Visits every page and finds <button> and <a> elements that look interactive
 * but have no href, no onclick handler, no form association, and no
 * aria-role indicating a passive element. These are likely bugs where a
 * designer added a styled element but forgot to wire it up.
 */

const LOCALE = "en";

const routes = [
  // Public listings
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
  "/checkout",
  "/search",
  "/thank-you",
  "/terms",
  "/privacy",
  "/cookies",
  "/membership/payment",

  // Detail pages
  "/poetry/the-cartographers-of-silence",
  "/photography/fog-studies-3",
  "/photography/series/fog-studies",
  "/essays/on-longing-and-algorithms",
  "/books/nocturnal-echoes",
  "/music/nocturnal-echoes",
  "/research/nocturnal-poetics",
  "/events/selenarium-night",
  "/shop/nocturnal-echoes",

  // Auth
  "/login",
  "/signup",
  "/reset-password",
  "/verify-email",

  // Member
  "/account",
  "/patron",

  // Admin
  "/admin",
  "/admin/content",
  "/admin/editor",
  "/admin/analytics",
  "/admin/members",
  "/admin/newsletter",
  "/admin/newsletter/compose",
  "/admin/settings",
  "/admin/scriptorium",
  "/admin/partnerships",
  "/admin/quotes",
  "/admin/events",
  "/admin/orders",
  "/admin/media",
  "/admin/seo",
  "/admin/seo/editor",
  "/admin/membership",
  "/admin/upload",
  "/admin/tribe-bio",
];

// Elements we intentionally skip:
// - <button type="submit"> inside a <form> — these are wired up via form submission
// - Elements inside <select> or <details> — native browser interactivity
// - Toolbar buttons in the rich text editor (they have title attributes)
// - Toggle switches (small buttons that toggle visual state)
// - Elements with aria-hidden="true"
const IGNORED_SELECTORS = [
  'form button[type="submit"]',
  "select",
  "details summary",
  '[aria-hidden="true"]',
];

for (const route of routes) {
  test(`no dead buttons on ${route}`, async ({ page }) => {
    const url = `/${LOCALE}${route}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for client-side hydration
    await page.waitForTimeout(1000);

    // Find all buttons and anchor-styled elements that do nothing
    const deadElements = await page.evaluate((ignoredSelectors) => {
      const results: string[] = [];

      // Check <button> elements
      const buttons = document.querySelectorAll("button");
      for (const btn of buttons) {
        // Skip if inside a form (form submission handles it)
        if (btn.closest("form")) continue;

        // Skip if it matches any ignored selector
        if (ignoredSelectors.some((sel) => btn.matches(sel) || btn.closest(sel)))
          continue;

        // Skip if it has an onclick handler (React attaches via __reactFiber)
        // We check for event listeners by looking at React's internal props
        const hasReactHandler = Object.keys(btn).some(
          (key) =>
            key.startsWith("__reactFiber") || key.startsWith("__reactProps"),
        );

        if (hasReactHandler) {
          // Check if the React props have any onClick/onChange/onSubmit handler
          const reactPropsKey = Object.keys(btn).find((key) =>
            key.startsWith("__reactProps"),
          );
          if (reactPropsKey) {
            const props = (btn as unknown as Record<string, Record<string, unknown>>)[reactPropsKey];
            if (props && (props.onClick || props.onChange || props.onSubmit)) {
              continue;
            }
          }
        }

        // Skip toggle switches (small buttons with relative positioning that contain a circle)
        const style = window.getComputedStyle(btn);
        if (
          btn.classList.contains("rounded-full") &&
          btn.querySelector(".rounded-full") &&
          btn.offsetWidth < 50
        ) {
          continue;
        }

        // This button has no handler — it's dead
        const text = btn.textContent?.trim().substring(0, 60) || "(empty)";
        const classes = btn.className.substring(0, 80);
        results.push("<button> \"" + text + "\" [" + classes + "]");
      }

      // Check <a> elements without href
      const anchors = document.querySelectorAll("a");
      for (const a of anchors) {
        if (ignoredSelectors.some((sel) => a.matches(sel) || a.closest(sel)))
          continue;

        const href = a.getAttribute("href");
        if (!href || href === "#" || href === "javascript:void(0)") {
          const text = a.textContent?.trim().substring(0, 60) || "(empty)";
          results.push("<a> \"" + text + "\" href=\"" + (href || "(none)") + "\"");
        }
      }

      // Check <div>/<span> elements styled to look like buttons but with no handler
      // This includes cursor-pointer elements AND elements styled as CTAs
      // (uppercase tracking, bg-accent, border with button-like padding)
      const styledButtons = document.querySelectorAll(
        'div:not(button):not(a), span:not(button):not(a)',
      );
      for (const el of styledButtons) {
        if (
          ignoredSelectors.some(
            (sel) => el.matches(sel) || el.closest(sel),
          )
        )
          continue;

        // Skip if inside an <a> or <button>
        if (el.closest("a") || el.closest("button")) continue;

        const cls = el.className || "";
        const hasCursorPointer = cls.includes("cursor-pointer");

        // Detect CTA-styled elements: uppercase text + tracking + button-like padding/bg
        // Exclude small tag/badge labels (text-[9px], text-[10px], py-1) — those are informational
        const isSmallLabel =
          cls.includes("text-[9px]") ||
          cls.includes("text-[10px]") ||
          (cls.includes("py-1") && !cls.includes("py-1.") && !cls.includes("py-10"));
        const isCtaStyled =
          !isSmallLabel &&
          cls.includes("uppercase") &&
          cls.includes("tracking-") &&
          (cls.includes("bg-accent") ||
            cls.includes("border-accent")) &&
          (cls.includes("py-") || cls.includes("px-"));

        if (!hasCursorPointer && !isCtaStyled) continue;

        // Check for React click handlers
        const reactPropsKey = Object.keys(el).find((key) =>
          key.startsWith("__reactProps"),
        );
        if (reactPropsKey) {
          const props = (el as unknown as Record<string, Record<string, unknown>>)[reactPropsKey];
          if (props && props.onClick) continue;
        }

        // Skip elements with no visible text (decorative)
        const text = el.textContent?.trim().substring(0, 60) || "";
        if (!text) continue;

        const tag = el.tagName.toLowerCase();
        const reason = hasCursorPointer ? "cursor-pointer" : "CTA-styled";
        results.push("<" + tag + "> " + reason + " \"" + text + "\"");
      }

      return results;
    }, IGNORED_SELECTORS);

    // Report findings
    if (deadElements.length > 0) {
      const report = deadElements
        .map((el, i) => `  ${i + 1}. ${el}`)
        .join("\n");
      expect(
        deadElements,
        `Found ${deadElements.length} dead interactive element(s) on ${route}:\n${report}`,
      ).toEqual([]);
    }
  });
}
