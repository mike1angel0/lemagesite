import { prisma } from "@/lib/prisma";

export const SITE_URL =
  process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://theselenarium.art";

export type SiteConfig = {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  authorName: string;
  authorHandle: string;
  contactEmail: string;
  senderEmail: string;
  twitterHandle: string;
};

const CONFIG_KEYS = [
  "siteName",
  "siteDescription",
  "authorName",
  "authorHandle",
  "contactEmail",
  "senderEmail",
  "twitterHandle",
] as const;

const DEFAULTS: Record<(typeof CONFIG_KEYS)[number], string> = {
  siteName: "Selenarium",
  siteDescription:
    "Poetry, photography, music, and research from the Selenarium.",
  authorName: "Mihai Gavrilescu",
  authorHandle: "@lemagepoet",
  contactEmail: "hello@mihaiGavrilescu.com",
  senderEmail: "noreply@theselenarium.art",
  twitterHandle: "@lemagepoet",
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: [...CONFIG_KEYS] } },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  const get = (key: (typeof CONFIG_KEYS)[number]) =>
    map.get(key) || DEFAULTS[key];

  return {
    siteName: get("siteName"),
    siteUrl: SITE_URL,
    siteDescription: get("siteDescription"),
    authorName: get("authorName"),
    authorHandle: get("authorHandle"),
    contactEmail: get("contactEmail"),
    senderEmail: get("senderEmail"),
    twitterHandle: get("twitterHandle"),
  };
}
