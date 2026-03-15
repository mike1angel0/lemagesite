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

export async function createQuoteAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const text = (formData.get("text") as string)?.trim();
  const attribution = (formData.get("attribution") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();

  if (!text) return { error: "Quote text is required" };

  await prisma.quote.create({
    data: {
      text,
      attribution: attribution || null,
      location: location || null,
    },
  });

  return { success: true };
}

export async function updateQuoteAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  const text = (formData.get("text") as string)?.trim();
  const attribution = (formData.get("attribution") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();

  if (!id) return { error: "Missing quote id" };
  if (!text) return { error: "Quote text is required" };

  await prisma.quote.update({
    where: { id },
    data: {
      text,
      attribution: attribution || null,
      location: location || null,
    },
  });

  return { success: true };
}

export async function deleteQuoteAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing quote id" };

  await prisma.quote.delete({ where: { id } });
  return { success: true };
}
