import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mediaFile: {
      create: vi.fn().mockResolvedValue({ id: "media-1" }),
    },
  },
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

const { auth } = await import("@/lib/auth");
const { POST } = await import("../upload/route");

function makeRequest() {
  const formData = new FormData();
  formData.append("file", new File(["test"], "test.png", { type: "image/png" }));
  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  }) as unknown as import("next/server").NextRequest;
}

describe("POST /api/upload", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 when user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", role: "USER" },
      expires: "",
    } as any);
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });
});
