/**
 * Shared SEO metadata utilities for Selenarium.
 *
 * Usage in any page:
 *   import { makeMetadata } from "@/lib/seo/metadata";
 *   export const metadata = makeMetadata({ title: "Poetry", path: "/poetry", description: "..." });
 *
 * Or for dynamic pages:
 *   export async function generateMetadata({ params }) {
 *     return makeMetadata({ title: poem.title, description: poem.excerpt, path: `/poetry/${slug}` });
 *   }
 */

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";

const SITE_NAME = "Selenarium";
const AUTHOR = "Mihai Gavrilescu";
const LOCALES = ["en", "ro"] as const;

export function makeMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile" | "music.album" | "book";
  publishedAt?: string;
  modifiedAt?: string;
  noIndex?: boolean;
  locale?: string;
}): Metadata {
  const locale = opts.locale ?? "en";
  const canonicalUrl = `${SITE_URL}/${locale}${opts.path}`;
  const fullTitle = opts.title.includes(SITE_NAME)
    ? opts.title
    : `${opts.title} — ${SITE_NAME}`;
  const ogImage = opts.image ?? `${SITE_URL}/og-default.jpg`;

  // Build hreflang alternates
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${SITE_URL}/${loc}${opts.path}`;
  }
  languages["x-default"] = `${SITE_URL}/en${opts.path}`;

  return {
    title: fullTitle,
    description: opts.description,
    authors: [{ name: AUTHOR }],
    creator: AUTHOR,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: opts.type ?? "website",
      locale: locale === "ro" ? "ro_RO" : "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: opts.title,
        },
      ],
      ...(opts.publishedAt && {
        publishedTime: opts.publishedAt,
        modifiedTime: opts.modifiedAt ?? opts.publishedAt,
        authors: [AUTHOR],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description,
      images: [ogImage],
      creator: "@lemagepoet",
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Default metadata map for all static pages.
 * Used by the admin SEO engine and as fallback metadata config.
 */
export const PAGE_METADATA: Record<
  string,
  { title: string; description: string; type?: Metadata["openGraph"] extends { type?: infer T } ? T : string }
> = {
  "/": {
    title: "Selenarium — Poetry, Photography & Sound | Mihai Gavrilescu",
    description:
      "A digital selenarium for contemporary poetry, photography, music and cinema by lemagepoet (Mihai Gavrilescu). Explore curated collections, essays, and multimedia experiences.",
  },
  "/poetry": {
    title: "Poetry Collection",
    description:
      "Contemporary poetry exploring silence, memory, and the geometry of longing. Original works by lemagepoet (Mihai Gavrilescu). Read free poems and exclusive patron collections.",
  },
  "/photography": {
    title: "Photography",
    description:
      "Fine art photography series including Fog Studies, Winter Light, and Urban Solitude. Medium format film and digital works by lemagepoet.",
  },
  "/music": {
    title: "Music & Sound",
    description:
      "Ambient soundscapes, field recordings, and experimental music compositions. Listen to albums and tracks by lemagepoet (Mihai Gavrilescu).",
  },
  "/essays": {
    title: "Essays — Journal",
    description:
      "Long-form essays on silence, observation, AI philosophy, and the creative process by lemagepoet (Mihai Gavrilescu). Free and patron-exclusive writings.",
  },
  "/research": {
    title: "Research",
    description:
      "Research papers, investigations, and academic explorations in art, language, perception, and technology by Mihai Gavrilescu.",
  },
  "/about": {
    title: "About — lemagepoet (Mihai Gavrilescu)",
    description:
      "Biography and artistic statement. Poet, photographer, and sound artist based in Romania. Learn about the creator behind Selenarium.",
  },
  "/shop": {
    title: "Shop",
    description:
      "Shop books, prints, and artworks from Selenarium. Limited edition poetry collections and fine art photography prints by lemagepoet.",
  },
  "/books": {
    title: "Library — Books & Reading",
    description:
      "Poetry collections, chapbooks, and literary works by lemagepoet (Mihai Gavrilescu). Browse published books and forthcoming titles.",
  },
  "/membership/payment": {
    title: "Membership",
    description:
      "Join the Selenarium community. Access exclusive poetry, photography, behind-the-scenes content, early releases, and patron-only collections.",
  },
  "/contact": {
    title: "Contact",
    description:
      "Get in touch for collaborations, press inquiries, reading invitations, or to connect with lemagepoet (Mihai Gavrilescu).",
  },
};
