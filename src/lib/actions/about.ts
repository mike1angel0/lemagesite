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

const aboutKeys = [
  "about_displayName",
  "about_handle",
  "about_roles",
  "about_bio",
  "about_personalQuote",
  "about_education",
  "about_publications",
  "about_achievements",
  "about_collaborators",
  "about_supportHeading",
  "about_supportDescription",
];

export async function getAboutContentAction(): Promise<Record<string, string>> {
  const admin = await requireAdmin();
  if (!admin) return {};

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: aboutKeys } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function saveAboutContentAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  for (const key of aboutKeys) {
    const value = (formData.get(key) as string) || "";
    if (value) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  return { success: true };
}
