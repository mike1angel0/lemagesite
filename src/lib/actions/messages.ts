"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

export async function sendMessageAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();

  if (!subject || !body) return { error: "Subject and message are required" };

  await prisma.message.create({
    data: {
      userId: session.user.id,
      subject,
      body,
    },
  });

  return { success: true };
}

export async function replyMessageAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parentId = formData.get("parentId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!parentId || !body) return { error: "Reply body is required" };

  const parentMessage = await prisma.message.findUnique({
    where: { id: parentId },
  });

  if (!parentMessage) return { error: "Thread not found" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin && parentMessage.userId !== session.user.id) {
    return { error: "Not authorized" };
  }

  await prisma.message.create({
    data: {
      userId: parentMessage.userId,
      subject: parentMessage.subject,
      body,
      isFromAdmin: isAdmin,
      parentId,
    },
  });

  return { success: true };
}

export async function getMessagesForUser(userId: string) {
  const threads = await prisma.message.findMany({
    where: { userId, parentId: null },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return threads;
}

export async function getAllThreadsForAdmin() {
  const threads = await prisma.message.findMany({
    where: { parentId: null },
    include: {
      user: { select: { id: true, name: true, email: true } },
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return threads;
}

export async function markReadAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const messageId = formData.get("messageId") as string;
  if (!messageId) return { error: "Message ID required" };

  await prisma.message.update({
    where: { id: messageId },
    data: { read: true },
  });

  return { success: true };
}
