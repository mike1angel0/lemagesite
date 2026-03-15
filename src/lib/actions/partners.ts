"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

export async function addPartnerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  const name = (formData.get("name") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || null;
  const url = (formData.get("url") as string)?.trim() || null;
  const logo = (formData.get("logo") as string)?.trim() || null;

  if (!name) return { error: "Partner name is required" };

  await prisma.partner.create({
    data: { name, type, url, logo },
  });

  return { success: true };
}
