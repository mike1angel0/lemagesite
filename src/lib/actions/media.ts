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

export async function createMediaFileAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const type = (formData.get("type") as string)?.trim();
  const sizeStr = formData.get("size") as string;
  const cloudinaryId = (formData.get("cloudinaryId") as string)?.trim();

  if (!name || !url || !type) return { error: "Missing required fields" };

  await prisma.mediaFile.create({
    data: {
      name,
      url,
      type,
      size: sizeStr ? parseInt(sizeStr) : 0,
      cloudinaryId: cloudinaryId || null,
    },
  });

  return { success: true };
}

export async function deleteMediaAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing media id" };

  await prisma.mediaFile.delete({ where: { id } });
  return { success: true };
}
