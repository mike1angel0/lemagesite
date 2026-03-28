import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPodcastClient } from "./admin-podcast-client";

interface ContentAudioItem {
  id: string;
  title: string;
  slug: string;
  contentType: "POEM" | "ESSAY" | "RESEARCH";
  audioUrl: string;
  locale: "en" | "ro";
}

export default async function AdminPodcastPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const [episodes, poems, essays, research] = await Promise.all([
    prisma.podcastEpisode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.poem.findMany({
      where: { OR: [{ audioUrl: { not: null } }, { audioUrlRo: { not: null } }] },
      select: { id: true, title: true, titleRo: true, slug: true, audioUrl: true, audioUrlRo: true },
    }),
    prisma.essay.findMany({
      where: { OR: [{ audioUrl: { not: null } }, { audioUrlRo: { not: null } }] },
      select: { id: true, title: true, titleRo: true, slug: true, audioUrl: true, audioUrlRo: true },
    }),
    prisma.researchPaper.findMany({
      where: { OR: [{ audioUrl: { not: null } }, { audioUrlRo: { not: null } }] },
      select: { id: true, title: true, slug: true, audioUrl: true, audioUrlRo: true },
    }),
  ]);

  // Build list of linked content IDs from episodes
  const linkedContentIds = new Set(
    episodes.filter((e) => e.contentId).map((e) => e.contentId!)
  );

  // Build unlinked audio items
  const unlinkedAudio: ContentAudioItem[] = [];

  for (const p of poems) {
    if (p.audioUrl && !linkedContentIds.has(p.id)) {
      unlinkedAudio.push({ id: p.id, title: p.title, slug: p.slug, contentType: "POEM", audioUrl: p.audioUrl, locale: "en" });
    }
    if (p.audioUrlRo && !linkedContentIds.has(p.id)) {
      unlinkedAudio.push({ id: p.id, title: p.titleRo || p.title, slug: p.slug, contentType: "POEM", audioUrl: p.audioUrlRo, locale: "ro" });
    }
  }

  for (const e of essays) {
    if (e.audioUrl && !linkedContentIds.has(e.id)) {
      unlinkedAudio.push({ id: e.id, title: e.title, slug: e.slug, contentType: "ESSAY", audioUrl: e.audioUrl, locale: "en" });
    }
    if (e.audioUrlRo && !linkedContentIds.has(e.id)) {
      unlinkedAudio.push({ id: e.id, title: e.titleRo || e.title, slug: e.slug, contentType: "ESSAY", audioUrl: e.audioUrlRo, locale: "ro" });
    }
  }

  for (const r of research) {
    if (r.audioUrl && !linkedContentIds.has(r.id)) {
      unlinkedAudio.push({ id: r.id, title: r.title, slug: r.slug, contentType: "RESEARCH", audioUrl: r.audioUrl, locale: "en" });
    }
    if (r.audioUrlRo && !linkedContentIds.has(r.id)) {
      unlinkedAudio.push({ id: r.id, title: r.title, slug: r.slug, contentType: "RESEARCH", audioUrl: r.audioUrlRo, locale: "ro" });
    }
  }

  const episodeRows = episodes.map((ep) => ({
    id: ep.id,
    title: ep.title,
    slug: ep.slug,
    description: ep.description,
    audioUrl: ep.audioUrl,
    duration: ep.duration,
    coverImage: ep.coverImage,
    contentType: ep.contentType,
    contentId: ep.contentId,
    publishedAt: ep.publishedAt?.toISOString() || null,
    createdAt: ep.createdAt.toISOString(),
  }));

  const fromContent = episodeRows.filter((e) => e.contentId);
  const standalone = episodeRows.filter((e) => !e.contentId);

  return (
    <AdminPodcastClient
      episodes={episodeRows}
      fromContent={fromContent}
      standalone={standalone}
      unlinkedAudio={unlinkedAudio}
      summary={{
        total: episodeRows.length,
        fromContent: fromContent.length,
        standalone: standalone.length,
        unlinked: unlinkedAudio.length,
      }}
    />
  );
}
