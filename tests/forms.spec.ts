import { test, expect } from "@playwright/test";

const LOCALE = "en";
const BASE = `/${LOCALE}`;

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/contact`);
  });

  test("renders all form fields", async ({ page }) => {
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#message")).toBeVisible();
  });

  test("form fields accept input", async ({ page }) => {
    await page.locator("#name").fill("John Doe");
    await page.locator("#email").fill("john@example.com");
    await page.locator("#message").fill("Hello, this is a test message.");

    await expect(page.locator("#name")).toHaveValue("John Doe");
    await expect(page.locator("#email")).toHaveValue("john@example.com");
    await expect(page.locator("#message")).toHaveValue(
      "Hello, this is a test message."
    );
  });

  test("displays contact email link", async ({ page }) => {
    const emailLink = page.getByRole("link", {
      name: /hello@mihaiGavrilescu/i,
    });
    await expect(emailLink).toBeVisible();
  });
});

test.describe("Login form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test("renders email and password fields", async ({ page }) => {
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("form fields accept input", async ({ page }) => {
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("secretpassword");

    await expect(page.locator("#email")).toHaveValue("user@example.com");
    await expect(page.locator("#password")).toHaveValue("secretpassword");
  });

  test("password field masks input", async ({ page }) => {
    const passwordField = page.locator("#password");
    await expect(passwordField).toHaveAttribute("type", "password");
  });

  test("has a login submit button", async ({ page }) => {
    const button = page.getByRole("button", { name: /log in/i });
    await expect(button).toBeVisible();
  });

  test("has Google sign-in button", async ({ page }) => {
    const googleBtn = page.getByRole("button", { name: /google/i });
    await expect(googleBtn).toBeVisible();
  });
});

test.describe("Signup form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/signup`);
  });

  test("renders all signup fields", async ({ page }) => {
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
  });

  test("form fields accept input", async ({ page }) => {
    await page.locator("#name").fill("Jane Smith");
    await page.locator("#email").fill("jane@example.com");
    await page.locator("#password").fill("mypassword123");
    await page.locator("#confirmPassword").fill("mypassword123");

    await expect(page.locator("#name")).toHaveValue("Jane Smith");
    await expect(page.locator("#email")).toHaveValue("jane@example.com");
    await expect(page.locator("#password")).toHaveValue("mypassword123");
    await expect(page.locator("#confirmPassword")).toHaveValue(
      "mypassword123"
    );
  });

  test("has create account button", async ({ page }) => {
    const button = page.getByRole("button", { name: /create account/i });
    await expect(button).toBeVisible();
  });

  test("has Google sign-in button", async ({ page }) => {
    const googleBtn = page.getByRole("button", { name: /google/i });
    await expect(googleBtn).toBeVisible();
  });
});

test.describe("Reset password form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
  });

  test("renders email field", async ({ page }) => {
    await expect(page.locator("#reset-email")).toBeVisible();
  });

  test("email field accepts input", async ({ page }) => {
    await page.locator("#reset-email").fill("forgot@example.com");
    await expect(page.locator("#reset-email")).toHaveValue(
      "forgot@example.com"
    );
  });

  test("has send reset link button", async ({ page }) => {
    const button = page.getByRole("button", { name: /send.*reset/i });
    await expect(button).toBeVisible();
  });
});

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/search`);
  });

  test("renders search input", async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();
  });

  test("search input accepts text", async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill("nocturnal");
    await expect(searchInput).toHaveValue("nocturnal");
  });

  test("displays search results", async ({ page }) => {
    // The page has mock results pre-populated
    const results = page.locator("article, [class*='result'], a[href*='/']");
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });
});
