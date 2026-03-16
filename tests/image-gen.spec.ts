import { test, expect } from "@playwright/test";

test.describe("Poem image generation", () => {
  test("IG Post generates and downloads an image with cover", async ({ page }) => {
    // Navigate to a poem page
    await page.goto("/poetry/the-cartographers-of-silence");
    await page.waitForLoadState("networkidle");

    // Collect console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Collect download events
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 }).catch(() => null);

    // Click Share button
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    // Wait for the share sheet to appear
    await expect(page.getByText("Create Image")).toBeVisible();

    // Click "IG Post" button
    const igPostButton = page.getByRole("button", { name: "IG Post" });
    await expect(igPostButton).toBeVisible();
    await igPostButton.click();

    // Wait for generation to complete (button text changes to "Generating..." then back)
    await expect(page.getByText("Generating...")).toBeVisible({ timeout: 5000 }).catch(() => {
      // May be too fast to catch
    });

    // Wait for download or timeout
    const download = await downloadPromise;

    // Log any console errors for debugging
    if (consoleErrors.length > 0) {
      console.log("Console errors during image generation:");
      for (const err of consoleErrors) {
        console.log(`  - ${err}`);
      }
    }

    // Verify download happened
    expect(download).not.toBeNull();
    if (download) {
      const filename = download.suggestedFilename();
      expect(filename).toContain("ig-square");
      expect(filename).toContain(".png");
    }

    // Should have no "Image generation failed" error
    expect(consoleErrors.some((e) => e.includes("Image generation failed"))).toBe(false);
  });

  test("IG Story generates and downloads an image", async ({ page }) => {
    await page.goto("/poetry/the-cartographers-of-silence");
    await page.waitForLoadState("networkidle");

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 }).catch(() => null);

    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();
    await expect(page.getByText("Create Image")).toBeVisible();

    const igStoryButton = page.getByRole("button", { name: "IG Story" });
    await igStoryButton.click();

    const download = await downloadPromise;

    if (consoleErrors.length > 0) {
      console.log("Console errors during IG Story generation:");
      for (const err of consoleErrors) {
        console.log(`  - ${err}`);
      }
    }

    expect(download).not.toBeNull();
    if (download) {
      const filename = download.suggestedFilename();
      expect(filename).toContain("ig-story");
      expect(filename).toContain(".png");
    }

    expect(consoleErrors.some((e) => e.includes("Image generation failed"))).toBe(false);
  });
});
