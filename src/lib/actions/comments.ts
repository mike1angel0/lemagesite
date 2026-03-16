"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ContentType } from "@/generated/prisma/client";

export async function getComments(contentType: ContentType, contentId: string) {
  const comments = await prisma.comment.findMany({
    where: { contentType, contentId, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return comments;
}

export async function addCommentAction(
  contentType: ContentType,
  contentId: string,
  body: string,
  parentId?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to comment" };
  }

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) {
    return { error: "Comment must be between 1 and 2000 characters" };
  }

  // If replying, ensure parent exists and is top-level (max 1 level of nesting)
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.parentId) {
      return { error: "Invalid parent comment" };
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      contentType,
      contentId,
      body: trimmed,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return { success: true, comment };
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return { error: "Comment not found" };
  }

  // Only the author or an admin can delete
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (comment.userId !== session.user.id && user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { success: true };
}
