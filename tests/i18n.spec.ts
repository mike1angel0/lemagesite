import { test, expect } from "@playwright/test";

test.describe("Locale routing", () => {
  test("default locale (ro) serves pages without prefix", async ({ page }) => {
    const response = await page.goto("/poetry");
    expect(response?.status()).toBeLessThan(400);
    // Should NOT redirect to /ro/poetry
    expect(page.url()).not.toMatch(/\/ro\//);
  });

  test("English locale serves pages with /en prefix", async ({ page }) => {
    const response = await page.goto("/en/poetry");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
  });

  test("html lang attribute is set on the page", async ({ page }) => {
    await page.goto("/en/poetry", { waitUntil: "domcontentloaded" });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });
});

test.describe("Translations load correctly", () => {
  test("Romanian page has Romanian nav text", async ({ browser }) => {
    // Create a context with Romanian locale to ensure next-intl serves Romanian
    const context = await browser.newContext({ locale: "ro-RO" });
    const page = await context.newPage();
    await page.goto("/");

    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Poezie" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Fotografie" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Muzică" })).toBeVisible();
    await context.close();
  });

  test("English page has English nav text", async ({ page }) => {
    await page.goto("/en/");
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Poetry" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Photography" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Music" })).toBeVisible();
  });
});

test.describe("Locale switcher", () => {
  test("switching from ro to en changes URL and content", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "ro-RO" });
    const page = await context.newPage();
    await page.goto("/poetry");

    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Poezie" })).toBeVisible();

    // Click the language toggle link (shows "EN" when in Romanian locale)
    const langToggle = nav.getByRole("link", { name: "EN", exact: true });
    await langToggle.click();

    // Should now be on English version
    await expect(page).toHaveURL(/\/en\/poetry/);
    await expect(nav.getByRole("link", { name: "Poetry" })).toBeVisible();
    await context.close();
  });

  test("switching from en to ro changes URL to unprefixed path", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "ro-RO" });
    const page = await context.newPage();
    await page.goto("/en/poetry");

    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Poetry" })).toBeVisible();

    // Click language toggle (shows "RO" when in English locale)
    const langToggle = nav.getByRole("link", { name: "RO" });
    await langToggle.click();

    // Should navigate to Romanian version (no locale prefix)
    await expect(page).toHaveURL(/\/poetry$/);
    await expect(page.locator("body")).toBeVisible();
    await context.close();
  });
});

test.describe("Locale consistency across pages", () => {
  const pages = [
    "/poetry",
    "/photography",
    "/music",
    "/about",
    "/contact",
    "/membership",
  ];

  for (const path of pages) {
    test(`English page ${path} loads with English nav`, async ({ page }) => {
      await page.goto(`/en${path}`);
      const nav = page.locator("header nav");
      await expect(nav.getByRole("link", { name: "Poetry" })).toBeVisible();
    });
  }
});
