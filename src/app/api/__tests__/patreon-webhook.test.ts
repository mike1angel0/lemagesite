import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

const mockUpsert = vi.fn().mockResolvedValue({ id: "mem-1" });
const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    membership: { upsert: (...args: unknown[]) => mockUpsert(...args) },
  },
}));

const { POST } = await import("../patreon/webhook/route");

const SECRET = "test-webhook-secret";

function sign(body: string): string {
  return crypto.createHmac("sha256", SECRET).update(body).digest("hex");
}

function makeWebhookRequest(body: object, event: string, secret = SECRET) {
  const rawBody = JSON.stringify(body);
  const signature = sign(rawBody);

  return {
    text: () => Promise.resolve(rawBody),
    headers: new Headers({
      "x-patreon-event": event,
      "x-patreon-signature": signature,
    }),
  } as unknown as import("next/server").NextRequest;
}

function patreonPayload(email: string, amountCents: number) {
  return {
    data: {
      id: "pledge-1",
      attributes: { pledge_amount_cents: amountCents },
      relationships: { user: { data: { id: "patreon-user-1" } } },
    },
    included: [
      { type: "user", attributes: { email } },
    ],
  };
}

describe("POST /api/patreon/webhook", () => {
  beforeEach(() => {
    vi.stubEnv("PATREON_WEBHOOK_SECRET", SECRET);
    mockFindUnique.mockReset();
    mockUpsert.mockReset().mockResolvedValue({ id: "mem-1" });
  });

  it("rejects requests with invalid signature", async () => {
    const body = JSON.stringify({ data: {} });
    const req = {
      text: () => Promise.resolve(body),
      headers: new Headers({
        "x-patreon-event": "members:pledge:create",
        "x-patreon-signature": "bad-signature",
      }),
    } as unknown as import("next/server").NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("maps $5 pledge to SUPPORTER tier", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    const req = makeWebhookRequest(
      patreonPayload("test@test.com", 500),
      "members:pledge:create"
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "SUPPORTER", status: "ACTIVE" }),
      })
    );
  });

  it("maps $15 pledge to PATRON tier", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    const req = makeWebhookRequest(
      patreonPayload("test@test.com", 1500),
      "members:pledge:update"
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "PATRON" }),
      })
    );
  });

  it("maps $25+ pledge to INNER_CIRCLE tier", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    const req = makeWebhookRequest(
      patreonPayload("test@test.com", 2500),
      "members:pledge:create"
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "INNER_CIRCLE" }),
      })
    );
  });

  it("handles pledge deletion by setting CANCELLED + FREE", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
    const req = makeWebhookRequest(
      patreonPayload("test@test.com", 500),
      "members:pledge:delete"
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "FREE", status: "CANCELLED" }),
      })
    );
  });

  it("returns 200 even if user not found in DB", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = makeWebhookRequest(
      patreonPayload("unknown@test.com", 500),
      "members:pledge:create"
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
