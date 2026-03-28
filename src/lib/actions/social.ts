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

export async function captureSourceAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const url = (formData.get("url") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const contentType = (formData.get("contentType") as string)?.trim() || null;

  if (!url) return { error: "URL is required" };

  const existing = await prisma.socialSource.findUnique({ where: { url } });
  if (existing) return { error: "This URL has already been captured" };

  await prisma.socialSource.create({
    data: {
      url,
      content,
      contentType,
      capturedVia: "admin",
    },
  });

  return { success: true };
}

export async function deleteSourceAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing source ID" };

  await prisma.socialSource.delete({ where: { id } });
  return { success: true };
}

export async function approveRepostAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing repost ID" };

  await prisma.socialRepost.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  return { success: true };
}

export async function skipRepostAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing repost ID" };

  await prisma.socialRepost.update({
    where: { id },
    data: { status: "SKIPPED" },
  });

  return { success: true };
}

export async function editRepostAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  const editedText = (formData.get("editedText") as string)?.trim();
  if (!id || !editedText) return { error: "Missing required fields" };

  await prisma.socialRepost.update({
    where: { id },
    data: { editedText },
  });

  return { success: true };
}

export async function approveAllDraftsAction(
  _prevState: AuthState,
  _formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  await prisma.socialRepost.updateMany({
    where: { status: "DRAFT" },
    data: { status: "APPROVED" },
  });

  return { success: true };
}

export async function disconnectAccountAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing account ID" };

  await prisma.socialAccount.delete({ where: { id } });
  return { success: true };
}
