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

const PAGE_NAMESPACES = [
  "poetry",
  "photography",
  "essays",
  "research",
  "events",
  "books",
  "music",
  "shop",
  "membership",
] as const;

const FIELDS = ["sectionLabel", "heroTitle", "heroDescription"] as const;
const LOCALES = ["en", "ro"] as const;

export async function getPageContentSettingsAction(): Promise<Record<string, string>> {
  const admin = await requireAdmin();
  if (!admin) return {};

  const allKeys: string[] = [];
  for (const ns of PAGE_NAMESPACES) {
    for (const locale of LOCALES) {
      for (const field of FIELDS) {
        allKeys.push(`${locale}:${ns}.${field}`);
      }
    }
  }

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: allKeys } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function savePageContentAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const namespace = formData.get("namespace") as string;
  if (!PAGE_NAMESPACES.includes(namespace as (typeof PAGE_NAMESPACES)[number])) {
    return { error: "Invalid namespace" };
  }

  for (const locale of LOCALES) {
    for (const field of FIELDS) {
      const value = (formData.get(`${locale}:${field}`) as string) ?? "";
      const key = `${locale}:${namespace}.${field}`;

      if (value.trim() === "") {
        // Empty = delete override, fall back to translation file
        await prisma.siteSetting.deleteMany({ where: { key } });
      } else {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: value.trim() },
          create: { key, value: value.trim() },
        });
      }
    }
  }

  return { success: true };
}
