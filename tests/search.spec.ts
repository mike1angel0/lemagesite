import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("renders search page with input", async ({ page }) => {
    await page.goto("/en/search");
    const input = page.locator("input[name='q']");
    await expect(input).toBeVisible();
  });

  test("shows results for a query", async ({ page }) => {
    await page.goto("/en/search?q=test");
    // Should show result count text
    await expect(page.locator("text=/\\d+ results for/")).toBeVisible({ timeout: 10000 });
  });

  test("shows no results message for nonsense query", async ({ page }) => {
    await page.goto("/en/search?q=xyznonexistent123456");
    await expect(page.locator("text=/No results found/")).toBeVisible({ timeout: 10000 });
  });
});
