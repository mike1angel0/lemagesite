import { test, expect } from "@playwright/test";

const LOCALE = "en";

const routes: { name: string; path: string; expectedStatus?: number }[] = [
  // Public listings
  { name: "Home", path: "/" },
  { name: "Poetry", path: "/poetry" },
  { name: "Photography", path: "/photography" },
  { name: "Music", path: "/music" },
  { name: "Books", path: "/books" },
  { name: "Research", path: "/research" },
  { name: "Essays", path: "/essays" },
  { name: "Membership", path: "/membership" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Events", path: "/events" },
  { name: "Shop", path: "/shop" },
  { name: "Checkout", path: "/checkout" },
  { name: "Search", path: "/search" },
  { name: "Thank You", path: "/thank-you" },
  { name: "Terms", path: "/terms" },
  { name: "Privacy", path: "/privacy" },
  { name: "Cookies", path: "/cookies" },
  { name: "Membership Payment", path: "/membership/payment" },

  // Detail pages
  { name: "Poetry Detail", path: "/poetry/the-cartographers-of-silence" },
  { name: "Photography Detail", path: "/photography/fog-studies-3" },
  { name: "Photography Series", path: "/photography/series/fog-studies" },
  { name: "Essay Detail", path: "/essays/on-longing-and-algorithms" },
  { name: "Book Detail", path: "/books/nocturnal-echoes" },
  { name: "Music Detail", path: "/music/nocturnal-echoes" },
  { name: "Research Detail", path: "/research/nocturnal-poetics" },
  { name: "Event Detail", path: "/events/observatory-night" },
  { name: "Shop Detail", path: "/shop/nocturnal-echoes" },

  // Auth
  { name: "Login", path: "/login" },
  { name: "Signup", path: "/signup" },
  { name: "Reset Password", path: "/reset-password" },
  { name: "Verify Email", path: "/verify-email" },

  // Member
  { name: "Account", path: "/account" },
  { name: "Patron", path: "/patron" },

  // Admin
  { name: "Admin Dashboard", path: "/admin" },
  { name: "Admin Content", path: "/admin/content" },
  { name: "Admin Editor", path: "/admin/editor" },
  { name: "Admin Analytics", path: "/admin/analytics" },
  { name: "Admin Members", path: "/admin/members" },
  { name: "Admin Newsletter", path: "/admin/newsletter" },
  { name: "Admin Newsletter Compose", path: "/admin/newsletter/compose" },
  { name: "Admin Settings", path: "/admin/settings" },
  { name: "Admin Scriptorium", path: "/admin/scriptorium" },
  { name: "Admin Partnerships", path: "/admin/partnerships" },
  { name: "Admin Quotes", path: "/admin/quotes" },
  { name: "Admin Events", path: "/admin/events" },
  { name: "Admin Orders", path: "/admin/orders" },
  { name: "Admin Media", path: "/admin/media" },
  { name: "Admin SEO", path: "/admin/seo" },
  { name: "Admin SEO Editor", path: "/admin/seo/editor" },
  { name: "Admin Membership", path: "/admin/membership" },
  { name: "Admin Upload", path: "/admin/upload" },
  { name: "Admin Tribe Bio", path: "/admin/tribe-bio" },

  // 404
  { name: "404 Page", path: "/nonexistent-page", expectedStatus: 404 },
];

for (const route of routes) {
  test(`${route.name} (${route.path}) loads without errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const url = `/${LOCALE}${route.path}`;
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    if (route.expectedStatus) {
      expect(response?.status()).toBe(route.expectedStatus);
    } else {
      expect(response?.status()).toBeLessThan(400);
    }

    await expect(page.locator("body")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
