"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" ? user : null;
}

export async function createPodcastEpisodeAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const audioUrl = (formData.get("audioUrl") as string)?.trim();
  const duration = (formData.get("duration") as string)?.trim() || null;
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;
  const contentType = (formData.get("contentType") as string)?.trim() || null;
  const contentId = (formData.get("contentId") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };
  if (!audioUrl) return { error: "Audio URL is required" };

  const slug = slugify(title);

  const existing = await prisma.podcastEpisode.findUnique({ where: { slug } });
  if (existing) return { error: "An episode with this slug already exists" };

  await prisma.podcastEpisode.create({
    data: {
      title,
      slug,
      description,
      audioUrl,
      duration,
      coverImage,
      contentType,
      contentId,
      publishedAt: new Date(),
    },
  });

  return { success: true };
}

export async function deletePodcastEpisodeAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing episode ID" };

  await prisma.podcastEpisode.delete({ where: { id } });
  return { success: true };
}

export async function importContentAudioAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const contentType = (formData.get("contentType") as string)?.trim();
  const contentId = (formData.get("contentId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const audioUrl = (formData.get("audioUrl") as string)?.trim();
  const locale = (formData.get("locale") as string)?.trim() || "en";

  if (!contentType || !contentId || !title || !audioUrl) {
    return { error: "Missing required fields" };
  }

  const slug = slugify(`${title}-${locale}`);

  const existing = await prisma.podcastEpisode.findUnique({ where: { slug } });
  if (existing) return { error: "Episode already imported" };

  await prisma.podcastEpisode.create({
    data: {
      title: `${title} (${locale.toUpperCase()})`,
      slug,
      audioUrl,
      contentType,
      contentId,
      publishedAt: new Date(),
    },
  });

  return { success: true };
}
