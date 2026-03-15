import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminContentClient } from "./admin-content-client";

export default async function AdminContentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const [poems, photos, essays, research] = await Promise.all([
    prisma.poem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.essay.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.researchPaper.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const rows = [
    ...poems.map((p) => ({
      id: p.id,
      title: p.title,
      type: "Poem" as const,
      status: p.publishedAt ? "Published" : "Draft",
      access: p.accessTier,
      date: (p.publishedAt || p.createdAt).toISOString(),
    })),
    ...photos.map((p) => ({
      id: p.id,
      title: p.title,
      type: "Photo" as const,
      status: p.publishedAt ? "Published" : "Draft",
      access: p.accessTier,
      date: (p.publishedAt || p.createdAt).toISOString(),
    })),
    ...essays.map((e) => ({
      id: e.id,
      title: e.title,
      type: "Essay" as const,
      status: e.publishedAt ? "Published" : "Draft",
      access: e.accessTier,
      date: (e.publishedAt || e.createdAt).toISOString(),
    })),
    ...research.map((r) => ({
      id: r.id,
      title: r.title,
      type: "Research" as const,
      status: r.publishedAt ? "Published" : "Draft",
      access: r.accessTier,
      date: (r.publishedAt || r.createdAt).toISOString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <AdminContentClient rows={rows} />;
}
