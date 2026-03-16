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

export async function getSettingsAction(): Promise<Record<string, string>> {
  const admin = await requireAdmin();
  if (!admin) return {};

  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function saveSettingsAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const generalKeys = [
    "siteName", "language", "timezone",
    "siteDescription", "authorName", "authorHandle",
    "contactEmail", "senderEmail", "twitterHandle",
    "heroImage", "portraitImage", "ogDefaultImage",
  ];
  const socialKeys = [
    "instagram", "youtube", "tiktok", "facebook", "twitter", "bluesky",
    "threads", "mastodon", "medium", "substack", "spotify", "soundcloud",
    "bandcamp", "appleMusic", "github", "linkedin", "pinterest", "tumblr",
    "patreon", "kofi", "discord", "telegram", "whatsapp", "vimeo", "twitch",
    "behance", "dribbble", "flickr", "goodreads", "website",
  ];

  for (const key of generalKeys) {
    const value = (formData.get(key) as string) || "";
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  for (const key of socialKeys) {
    const value = (formData.get(key) as string)?.trim() || "";
    if (value) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    } else {
      await prisma.siteSetting.deleteMany({ where: { key } });
    }
  }

  return { success: true };
}
