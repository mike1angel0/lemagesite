import { test, expect } from "@playwright/test";

test.describe("RSS Feed", () => {
  test("serves valid RSS XML at /feed.xml", async ({ request }) => {
    const res = await request.get("/feed.xml");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toContain("xml");
    const body = await res.text();
    expect(body).toContain("<rss");
    expect(body).toContain("<channel>");
    expect(body).toContain("Selenarium");
  });
});

test.describe("OG Image API", () => {
  test("generates an image with title parameter", async ({ request }) => {
    const res = await request.get("/api/og?title=Test+Poem&type=Poetry");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toContain("image");
  });

  test("generates an image with default title", async ({ request }) => {
    const res = await request.get("/api/og");
    expect(res.status()).toBe(200);
  });
});

test.describe("Theme Toggle", () => {
  test("theme toggle button exists in nav", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.locator('button[aria-label^="Theme"]');
    await expect(toggle).toBeVisible();
  });

  test("clicking theme toggle changes data-theme", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.locator('button[aria-label^="Theme"]');
    const html = page.locator("html");

    // Click to cycle: dark -> light
    await toggle.click();
    const theme = await html.getAttribute("data-theme");
    expect(["light", "system"]).toContain(theme);
  });
});

test.describe("PWA Manifest", () => {
  test("manifest.json is accessible", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("Selenarium");
    expect(json.display).toBe("standalone");
  });
});

test.describe("Rate Limiting", () => {
  test("contact API returns 429 after too many requests", async ({ request }) => {
    const body = { name: "Test", email: "test@test.com", message: "A valid test message for rate limiting." };

    // Send 4 rapid requests (limit is 3/min)
    for (let i = 0; i < 3; i++) {
      await request.post("/api/contact", { data: body });
    }

    const res = await request.post("/api/contact", { data: body });
    expect(res.status()).toBe(429);
  });
});

test.describe("Checkout API", () => {
  test("returns 400 for invalid checkout request", async ({ request }) => {
    const res = await request.post("/api/checkout", { data: {} });
    expect(res.status()).toBe(400);
  });
});
