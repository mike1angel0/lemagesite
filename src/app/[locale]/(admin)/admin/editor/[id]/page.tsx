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

  const serialized = {
    id: content.id,
    contentType: content.contentType,
    title: content.title,
    body: bodyField,
    accessTier: (content as Record<string, unknown>).accessTier as string || "FREE",
    publishedAt: content.publishedAt,
    collection: (content as Record<string, unknown>).collection as string || "",
    category: (content as Record<string, unknown>).category as string || "",
    abstract: (content as Record<string, unknown>).abstract as string || "",
    doi: (content as Record<string, unknown>).doi as string || "",
    pdfUrl: (content as Record<string, unknown>).pdfUrl as string || "",
    imageUrl: (content as Record<string, unknown>).imageUrl as string || "",
  };

  return <EditorEditClient content={serialized} />;
}
