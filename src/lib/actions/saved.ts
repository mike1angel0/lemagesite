"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentType } from "@/generated/prisma/enums";

export async function toggleSaveAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const contentType = formData.get("contentType") as ContentType;
  const contentId = formData.get("contentId") as string;

  if (!contentType || !contentId) {
    return { error: "Missing contentType or contentId" };
  }

  const existing = await prisma.savedItem.findUnique({
    where: {
      userId_contentType_contentId: {
        userId: session.user.id,
        contentType,
        contentId,
      },
    },
  });

  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } });
    return { saved: false };
  } else {
    await prisma.savedItem.create({
      data: {
        userId: session.user.id,
        contentType,
        contentId,
      },
    });
    return { saved: true };
  }
}

export async function getSavedItems(userId: string) {
  const items = await prisma.savedItem.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
  });

  const resolved = await Promise.all(
    items.map(async (item) => {
      let title = "Untitled";
      let slug = "";

      switch (item.contentType) {
        case "POEM": {
          const poem = await prisma.poem.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (poem) { title = poem.title; slug = `/poetry/${poem.slug}`; }
          break;
        }
        case "ESSAY": {
          const essay = await prisma.essay.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (essay) { title = essay.title; slug = `/essays/${essay.slug}`; }
          break;
        }
        case "PHOTO": {
          const photo = await prisma.photo.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (photo) { title = photo.title; slug = `/photography/${photo.slug}`; }
          break;
        }
        case "BOOK": {
          const book = await prisma.book.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (book) { title = book.title; slug = `/books/${book.slug}`; }
          break;
        }
        case "ALBUM": {
          const album = await prisma.album.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (album) { title = album.title; slug = `/music/${album.slug}`; }
          break;
        }
        case "TRACK": {
          const track = await prisma.track.findUnique({
            where: { id: item.contentId },
            select: { title: true, albumId: true },
          });
          if (track) {
            title = track.title;
            const album = await prisma.album.findUnique({
              where: { id: track.albumId },
              select: { slug: true },
            });
            slug = album ? `/music/${album.slug}` : "";
          }
          break;
        }
        case "RESEARCH": {
          const paper = await prisma.researchPaper.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (paper) { title = paper.title; slug = `/research/${paper.slug}`; }
          break;
        }
        case "EVENT": {
          const event = await prisma.event.findUnique({
            where: { id: item.contentId },
            select: { title: true, slug: true },
          });
          if (event) { title = event.title; slug = `/events/${event.slug}`; }
          break;
        }
      }

      return {
        id: item.id,
        contentType: item.contentType,
        contentId: item.contentId,
        title,
        slug,
        savedAt: item.savedAt,
      };
    })
  );

  return resolved;
}

export async function isItemSaved(contentType: ContentType, contentId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const item = await prisma.savedItem.findUnique({
    where: {
      userId_contentType_contentId: {
        userId: session.user.id,
        contentType,
        contentId,
      },
    },
  });

  return !!item;
}
