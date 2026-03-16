import { test, expect } from "@playwright/test";

test.describe("RSS Feeds", () => {
  test("main feed returns valid XML", async ({ request }) => {
    const res = await request.get("/feed.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/rss+xml");
    const body = await res.text();
    expect(body).toContain("<?xml version");
    expect(body).toContain("<title>Selenarium</title>");
  });

  test("poetry feed returns valid XML", async ({ request }) => {
    const res = await request.get("/feed/poetry.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Selenarium — Poetry");
  });

  test("essays feed returns valid XML", async ({ request }) => {
    const res = await request.get("/feed/essays.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Selenarium — Essays");
  });

  test("research feed returns valid XML", async ({ request }) => {
    const res = await request.get("/feed/research.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Selenarium — Research");
  });
});
