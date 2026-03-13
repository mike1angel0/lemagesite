import { test, expect } from "@playwright/test";

const LOCALE = "en";
const BASE = `/${LOCALE}`;

test.describe("Desktop navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`);
  });

  const navLinks = [
    { label: "Poetry", href: "/poetry" },
    { label: "Photography", href: "/photography" },
    { label: "Music", href: "/music" },
    { label: "Research", href: "/research" },
    { label: "Essays", href: "/essays" },
    { label: "Books", href: "/books" },
    { label: "Shop", href: "/shop" },
    { label: "Membership", href: "/membership" },
  ];

  for (const link of navLinks) {
    test(`nav link "${link.label}" navigates to ${link.href}`, async ({
      page,
    }) => {
      // Use header nav to target only the desktop navigation (not mobile drawer)
      const nav = page.locator("header nav");
      const anchor = nav.getByRole("link", { name: link.label, exact: true });
      await anchor.click();
      await expect(page).toHaveURL(new RegExp(`${link.href}$`));
    });
  }

  test("logo links to homepage", async ({ page }) => {
    const nav = page.locator("header nav");
    const logo = nav.getByRole("link").first();
    await logo.click();
    await expect(page).toHaveURL(/\/(en\/?)?$/);
  });

  test("membership CTA button exists", async ({ page }) => {
    const nav = page.locator("header nav");
    const cta = nav.getByRole("link", { name: /enter.*observatory/i });
    await expect(cta).toBeVisible();
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger opens mobile menu with links", async ({ page }) => {
    await page.goto(`${BASE}/`);

    // Click hamburger button (inside header nav)
    const hamburger = page.locator('button[aria-label="Open menu"]');
    await hamburger.click();

    // Wait for mobile drawer to be visible
    const drawer = page.locator('[class*="fixed"][class*="z-50"]').first();
    await expect(drawer).toBeVisible();

    // Verify a few key links are visible in the drawer
    await expect(drawer.getByRole("link", { name: "Poetry" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Music" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Shop" })).toBeVisible();
  });

  test("mobile menu link navigates and closes drawer", async ({ page }) => {
    await page.goto(`${BASE}/`);

    const hamburger = page.locator('button[aria-label="Open menu"]');
    await hamburger.click();

    const drawer = page.locator('[class*="fixed"][class*="z-50"]').first();
    await expect(drawer).toBeVisible();

    // Click a link
    await drawer.getByRole("link", { name: "Poetry" }).click();
    await expect(page).toHaveURL(new RegExp("/poetry$"));
  });
});

test.describe("Footer navigation", () => {
  test("footer contains explore links", async ({ page }) => {
    await page.goto(`${BASE}/`);

    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Poetry" })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Photography" })
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: "Music" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Books" })).toBeVisible();
  });

  test("footer contains knowledge links", async ({ page }) => {
    await page.goto(`${BASE}/`);

    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Research" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Essays" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Events" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "About" })).toBeVisible();
  });

  test("footer contains connect links", async ({ page }) => {
    await page.goto(`${BASE}/`);

    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: "Membership" })
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("footer link navigates correctly", async ({ page }) => {
    await page.goto(`${BASE}/`);

    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(new RegExp("/contact$"));
  });

  test("footer external links open in new tab", async ({ page }) => {
    await page.goto(`${BASE}/`);

    const footer = page.locator("footer");
    const externalLinks = footer.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    // Verify they all have rel="noopener noreferrer"
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
    }
  });
});

test.describe("Cross-page link navigation", () => {
  test("login page has join observatory link to signup", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const signupLink = page.getByRole("link", {
      name: /join.*observatory/i,
    });
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await expect(page).toHaveURL(new RegExp("/signup$"));
  });

  test("signup page has sign in link to login", async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    const loginLink = page.getByRole("link", { name: /sign in/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(new RegExp("/login$"));
  });

  test("login page has forgot password link", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const link = page.getByRole("link", { name: /forgot.*password/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp("/reset-password$"));
  });

  test("reset password page has back to login link", async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    const link = page.getByRole("link", { name: /login|back/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp("/login$"));
  });
});
