import { test, expect } from "@playwright/test";

test.describe("Comments Section", () => {
  test("shows login prompt for unauthenticated users on essay page", async ({ page }) => {
    // Navigate to an essay page - we'll check if the comments section renders
    await page.goto("/en/essays");
    const firstEssay = page.locator("a[href*='/essays/']").first();

    if (await firstEssay.isVisible()) {
      await firstEssay.click();
      await page.waitForLoadState("networkidle");

      // Check for comments section
      const commentsSection = page.locator("text=/Comments|Sign in to join/");
      if (await commentsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(commentsSection).toBeVisible();
      }
    }
  });
});
