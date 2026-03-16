import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMembershipUpsert = vi.fn().mockResolvedValue({ id: "mem-1" });
const mockMembershipFindFirst = vi.fn();
const mockMembershipUpdate = vi.fn().mockResolvedValue({ id: "mem-1" });
const mockMembershipUpdateMany = vi.fn().mockResolvedValue({ count: 1 });

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: {
      upsert: (...args: unknown[]) => mockMembershipUpsert(...args),
      findFirst: (...args: unknown[]) => mockMembershipFindFirst(...args),
      update: (...args: unknown[]) => mockMembershipUpdate(...args),
      updateMany: (...args: unknown[]) => mockMembershipUpdateMany(...args),
    },
  },
}));

const mockConstructEvent = vi.fn();

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  },
}));

const { POST } = await import("../stripe/webhook/route");

function makeRequest(body = "{}") {
  return {
    text: () => Promise.resolve(body),
    headers: new Headers({
      "stripe-signature": "sig_test",
    }),
  } as unknown as import("next/server").NextRequest;
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    mockConstructEvent.mockReset();
    mockMembershipUpsert.mockReset().mockResolvedValue({ id: "mem-1" });
    mockMembershipFindFirst.mockReset();
    mockMembershipUpdate.mockReset().mockResolvedValue({ id: "mem-1" });
    mockMembershipUpdateMany.mockReset().mockResolvedValue({ count: 1 });
  });

  it("rejects invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });

  it("handles checkout.session.completed — creates membership", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-1", tier: "patron" },
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockMembershipUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: expect.objectContaining({
          tier: "PATRON",
          status: "ACTIVE",
          stripeCustomerId: "cus_123",
        }),
      })
    );
  });

  it("handles checkout.session.completed — maps inner-circle tier", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-1", tier: "inner-circle" },
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockMembershipUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "INNER_CIRCLE" }),
      })
    );
  });

  it("handles subscription updated — updates tier by price ID", async () => {
    vi.stubEnv("STRIPE_PRICE_PATRON", "price_patron_test");
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          customer: "cus_123",
          status: "active",
          items: { data: [{ price: { id: "price_patron_test" } }] },
        },
      },
    });
    mockMembershipFindFirst.mockResolvedValue({ id: "mem-1" });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockMembershipUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tier: "PATRON", status: "ACTIVE" }),
      })
    );
  });

  it("handles subscription deleted — cancels membership", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { customer: "cus_456" },
      },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockMembershipUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeCustomerId: "cus_456" },
        data: { status: "CANCELLED", tier: "FREE" },
      })
    );
  });
});
