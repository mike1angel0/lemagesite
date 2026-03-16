import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPageContentClient } from "./admin-page-content-client";
import enMessages from "@/messages/en.json";
import roMessages from "@/messages/ro.json";

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

function buildDefaults(): Record<string, string> {
  const defaults: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources: Record<string, any> = { en: enMessages, ro: roMessages };

  for (const locale of ["en", "ro"] as const) {
    for (const ns of PAGE_NAMESPACES) {
      for (const field of FIELDS) {
        const val = sources[locale]?.[ns]?.[field];
        if (typeof val === "string") {
          defaults[`${locale}:${ns}.${field}`] = val;
        }
      }
    }
  }
  return defaults;
}

export default async function AdminPageContentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  // Fetch all page content overrides
  const allSettings = await prisma.siteSetting.findMany({
    where: {
      key: { contains: ":" },
    },
  });

  // Filter to only page content keys (locale:namespace.field pattern)
  const pageContentKeys = allSettings.filter((s) =>
    /^(en|ro):\w+\.(sectionLabel|heroTitle|heroDescription)$/.test(s.key)
  );

  const settingsMap: Record<string, string> = {};
  for (const s of pageContentKeys) {
    settingsMap[s.key] = s.value;
  }

  const defaults = buildDefaults();

  return (
    <AdminPageContentClient
      initialSettings={settingsMap}
      defaults={defaults}
    />
  );
}
