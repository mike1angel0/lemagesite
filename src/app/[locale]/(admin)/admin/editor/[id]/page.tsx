import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getContentByIdAction } from "@/lib/actions/content";
import { EditorEditClient } from "./editor-edit-client";

interface EditorEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditorEditPage({ params }: EditorEditPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const { id } = await params;
  const content = await getContentByIdAction(id);

  if (!content) notFound();

  // Serialize for client — extract the body field from type-specific fields
  const bodyField =
    content.contentType === "Photo"
      ? (content as Record<string, unknown>).description as string || ""
      : (content as Record<string, unknown>).body as string || (content as Record<string, unknown>).abstract as string || "";

  const r = content as Record<string, unknown>;
  const exifData = (r.exifData as Record<string, string> | null) ?? {};
  const series = r.series as { name: string } | null;
  const serialized = {
    id: content.id,
    contentType: content.contentType,
    title: content.title,
    body: bodyField,
    accessTier: r.accessTier as string || "FREE",
    publishedAt: content.publishedAt,
    collection: r.collection as string || "",
    category: r.category as string || "",
    abstract: r.abstract as string || "",
    doi: r.doi as string || "",
    pdfUrl: r.pdfUrl as string || "",
    imageUrl: r.imageUrl as string || "",
    thumbnail: r.thumbnail as string || "",
    coverImage: r.coverImage as string || "",
    readTime: r.readTime as number | undefined,
    essayCategory: r.category as string || "",
    titleRo: r.titleRo as string | null || null,
    bodyRo: (r.bodyRo || r.descriptionRo) as string | null || null,
    camera: exifData.camera || "",
    location: exifData.location || "",
    year: exifData.year || "",
    seriesName: series?.name || "",
    references: r.references as string | null || null,
    excerpt: r.excerpt as string | null || null,
    language: r.language as string | null || null,
  };

  return <EditorEditClient content={serialized} />;
}
