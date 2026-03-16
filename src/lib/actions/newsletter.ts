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
  excerpt?: string | null;
  image?: string | null;
  slug: string;
  meta?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
};

function snippetFromBody(body: string | null): string | null {
  if (!body?.trim()) return null;
  // Strip markdown syntax and take first ~200 chars of plain text
  const plain = body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.*?\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .trim();
  if (!plain) return null;
  return plain.length > 200 ? plain.slice(0, 200) + "..." : plain;
}

export async function searchContentForLinkingAction(query: string, type?: string) {
  const admin = await requireAdmin();
  if (!admin) return [];

  const results: LinkedContentItem[] = [];
  const where = query
    ? { title: { contains: query, mode: "insensitive" as const } }
    : {};

  if (!type || type === "Poem") {
    const poems = await prisma.poem.findMany({
      where,
      select: { id: true, title: true, slug: true, excerpt: true, body: true, collection: true, coverImage: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    results.push(...poems.map((p) => ({
      id: p.id, type: "Poem" as const, title: p.title, slug: `/poetry/${p.slug}`,
      excerpt: p.excerpt || snippetFromBody(p.body), image: p.coverImage, meta: p.collection,
    })));
  }
  if (!type || type === "Photo") {
    const photos = await prisma.photo.findMany({
      where,
      select: { id: true, title: true, slug: true, imageUrl: true, description: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    results.push(...photos.map((p) => ({
      id: p.id, type: "Photo" as const, title: p.title, slug: `/photography/${p.slug}`,
      excerpt: p.description, image: p.imageUrl,
    })));
  }
  if (!type || type === "Essay") {
    const essays = await prisma.essay.findMany({
      where,
      select: { id: true, title: true, slug: true, excerpt: true, body: true, thumbnail: true, readTime: true, category: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    results.push(...essays.map((e) => ({
      id: e.id, type: "Essay" as const, title: e.title, slug: `/essays/${e.slug}`,
      excerpt: e.excerpt || snippetFromBody(e.body), image: e.thumbnail, meta: e.readTime ? `${e.readTime} min read` : e.category,
    })));
  }
  if (!type || type === "Research") {
    const research = await prisma.researchPaper.findMany({
      where,
      select: { id: true, title: true, slug: true, abstract: true, body: true, tags: true, coverImage: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    results.push(...research.map((r) => ({
      id: r.id, type: "Research" as const, title: r.title, slug: `/research/${r.slug}`,
      excerpt: r.abstract ? r.abstract.slice(0, 200) : snippetFromBody(r.body), image: r.coverImage, meta: r.tags.slice(0, 3).join(", "),
    })));
  }
  if (!type || type === "Event") {
    const events = await prisma.event.findMany({
      where: query ? { title: { contains: query, mode: "insensitive" } } : {},
      select: { id: true, title: true, slug: true, description: true, location: true, date: true, image: true },
      take: 10,
      orderBy: { date: "desc" },
    });
    results.push(...events.map((e) => ({
      id: e.id, type: "Event" as const, title: e.title, slug: `/events/${e.slug}`,
      excerpt: e.description ? e.description.slice(0, 200) : null, image: e.image,
      meta: `${e.date.toLocaleDateString("en", { month: "short", day: "numeric" })}${e.location ? ` · ${e.location}` : ""}`,
      eventDate: e.date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }),
      eventLocation: e.location,
    })));
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
