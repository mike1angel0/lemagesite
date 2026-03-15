"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" ? user : null;
}

export type LinkedContentItem = {
  id: string;
  type: "Poem" | "Photo" | "Essay" | "Research" | "Event";
  title: string;
};

export async function searchContentForLinkingAction(query: string, type?: string) {
  const admin = await requireAdmin();
  if (!admin) return [];

  const results: LinkedContentItem[] = [];
  const where = query
    ? { title: { contains: query, mode: "insensitive" as const } }
    : {};

  if (!type || type === "Poem") {
    const poems = await prisma.poem.findMany({ where, select: { id: true, title: true }, take: 10, orderBy: { createdAt: "desc" } });
    results.push(...poems.map((p) => ({ id: p.id, type: "Poem" as const, title: p.title })));
  }
  if (!type || type === "Photo") {
    const photos = await prisma.photo.findMany({ where, select: { id: true, title: true }, take: 10, orderBy: { createdAt: "desc" } });
    results.push(...photos.map((p) => ({ id: p.id, type: "Photo" as const, title: p.title })));
  }
  if (!type || type === "Essay") {
    const essays = await prisma.essay.findMany({ where, select: { id: true, title: true }, take: 10, orderBy: { createdAt: "desc" } });
    results.push(...essays.map((e) => ({ id: e.id, type: "Essay" as const, title: e.title })));
  }
  if (!type || type === "Research") {
    const research = await prisma.researchPaper.findMany({ where, select: { id: true, title: true }, take: 10, orderBy: { createdAt: "desc" } });
    results.push(...research.map((r) => ({ id: r.id, type: "Research" as const, title: r.title })));
  }
  if (!type || type === "Event") {
    const events = await prisma.event.findMany({ where: query ? { title: { contains: query, mode: "insensitive" } } : {}, select: { id: true, title: true }, take: 10, orderBy: { date: "desc" } });
    results.push(...events.map((e) => ({ id: e.id, type: "Event" as const, title: e.title })));
  }

  return results;
}

export async function getRecipientCountAction(minimumTier: string) {
  const admin = await requireAdmin();
  if (!admin) return 0;

  if (minimumTier === "FREE") {
    return prisma.user.count({ where: { newsletterSubscribed: true } });
  }

  const tierOrder = ["SUPPORTER", "PATRON", "INNER_CIRCLE"];
  const tierIndex = tierOrder.indexOf(minimumTier);
  const validTiers = tierIndex >= 0 ? tierOrder.slice(tierIndex) : tierOrder;

  return prisma.user.count({
    where: {
      newsletterSubscribed: true,
      membership: { tier: { in: validTiers as ("SUPPORTER" | "PATRON" | "INNER_CIRCLE")[] } },
    },
  });
}

export async function createNewsletterAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const subject = (formData.get("subject") as string)?.trim();
  const previewText = (formData.get("previewText") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const scheduledAtStr = formData.get("scheduledAt") as string;
  const shouldSchedule = formData.get("schedule") === "true";
  const linkedContentRaw = formData.get("linkedContent") as string;
  const audience = (formData.get("audience") as string) || "all";
  const minimumTier = (formData.get("minimumTier") as string) || "FREE";
  const fromName = (formData.get("fromName") as string)?.trim();
  const replyTo = (formData.get("replyTo") as string)?.trim();

  if (!subject) return { error: "Subject is required" };
  if (!body) return { error: "Body is required" };

  let linkedContent = null;
  if (linkedContentRaw) {
    try { linkedContent = JSON.parse(linkedContentRaw); } catch { /* ignore */ }
  }

  await prisma.newsletter.create({
    data: {
      subject,
      previewText: previewText || null,
      body,
      status: shouldSchedule && scheduledAtStr ? "SCHEDULED" : "DRAFT",
      scheduledAt: shouldSchedule && scheduledAtStr ? new Date(scheduledAtStr) : null,
      linkedContent,
      audience,
      minimumTier,
      fromName: fromName || null,
      replyTo: replyTo || null,
    },
  });

  return { success: true };
}

export async function updateNewsletterAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  const subject = (formData.get("subject") as string)?.trim();
  const previewText = (formData.get("previewText") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const scheduledAtStr = formData.get("scheduledAt") as string;
  const shouldSchedule = formData.get("schedule") === "true";
  const linkedContentRaw = formData.get("linkedContent") as string;
  const audience = (formData.get("audience") as string) || "all";
  const minimumTier = (formData.get("minimumTier") as string) || "FREE";
  const fromName = (formData.get("fromName") as string)?.trim();
  const replyTo = (formData.get("replyTo") as string)?.trim();

  if (!id) return { error: "Missing newsletter id" };
  if (!subject) return { error: "Subject is required" };

  let linkedContent = undefined;
  if (linkedContentRaw) {
    try { linkedContent = JSON.parse(linkedContentRaw); } catch { /* ignore */ }
  }

  await prisma.newsletter.update({
    where: { id },
    data: {
      subject,
      previewText: previewText || null,
      body: body || undefined,
      status: shouldSchedule && scheduledAtStr ? "SCHEDULED" : "DRAFT",
      scheduledAt: shouldSchedule && scheduledAtStr ? new Date(scheduledAtStr) : null,
      linkedContent,
      audience,
      minimumTier,
      fromName: fromName || null,
      replyTo: replyTo || null,
    },
  });

  return { success: true };
}

export async function deleteNewsletterAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing newsletter id" };

  await prisma.newsletter.delete({ where: { id } });
  return { success: true };
}
