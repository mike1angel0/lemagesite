import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    comment: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "new-comment", body: "test" }),
      delete: vi.fn().mockResolvedValue({}),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: "user1", role: "USER" }),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addCommentAction, deleteCommentAction, getComments } from "@/lib/actions/comments";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getComments", () => {
  it("returns comments for given content", async () => {
    (prisma.comment.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "c1", body: "Hello", replies: [], user: { id: "u1", name: "Alice", image: null } },
    ]);

    const comments = await getComments("ESSAY", "essay-1");
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe("Hello");
  });
});

describe("addCommentAction", () => {
  it("requires authentication", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const result = await addCommentAction("ESSAY", "essay-1", "test");
    expect(result.error).toBe("You must be signed in to comment");
  });

  it("validates comment body length", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: { id: "user1" } });

    const result = await addCommentAction("ESSAY", "essay-1", "");
    expect(result.error).toBe("Comment must be between 1 and 2000 characters");
  });

  it("creates comment when authenticated", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.comment.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "c1",
      body: "Great post!",
      user: { id: "user1", name: "Test", image: null },
    });

    const result = await addCommentAction("ESSAY", "essay-1", "Great post!");
    expect(result.success).toBe(true);
  });

  it("rejects nested replies (max 1 level)", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.comment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "parent",
      parentId: "grandparent", // already a reply
    });

    const result = await addCommentAction("ESSAY", "essay-1", "reply", "parent");
    expect(result.error).toBe("Invalid parent comment");
  });
});

describe("deleteCommentAction", () => {
  it("requires authentication", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const result = await deleteCommentAction("c1");
    expect(result.error).toBe("Not authenticated");
  });

  it("allows owner to delete", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: { id: "user1" } });
    (prisma.comment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "c1",
      userId: "user1",
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "user1",
      role: "USER",
    });

    const result = await deleteCommentAction("c1");
    expect(result.success).toBe(true);
  });
});
