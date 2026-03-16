import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock resend before importing the route
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn().mockResolvedValue({ id: "test-id" }),
    };
  },
}));

// Mock rate limiter to always allow
vi.mock("@/lib/rate-limit", () => ({
  contactLimiter: {
    check: () => ({ success: true, remaining: 10, resetMs: 60000 }),
  },
}));

const { POST } = await import("../contact/route");

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

describe("POST /api/contact", () => {
  it("returns 400 for missing fields", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ name: "Test", email: "not-email", message: "Hello world!!" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for short message", async () => {
    const res = await POST(makeRequest({ name: "Test", email: "test@test.com", message: "Hi" }));
    expect(res.status).toBe(400);
  });

  it("returns success for valid data", async () => {
    const origKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = "re_test_123";
    try {
      const res = await POST(
        makeRequest({ name: "Test User", email: "test@test.com", message: "This is a valid test message." })
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    } finally {
      if (origKey === undefined) {
        delete process.env.RESEND_API_KEY;
      } else {
        process.env.RESEND_API_KEY = origKey;
      }
    }
  });
});
