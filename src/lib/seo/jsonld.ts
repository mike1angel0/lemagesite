/**
 * JSON-LD Structured Data generators for Selenarium.
 *
 * Usage in any page/layout:
 *   import { JsonLd } from "@/lib/seo/jsonld";
 *   <JsonLd data={websiteJsonLd()} />
 */

import type { ReactElement } from "react";
import React from "react";

import { SITE_URL } from "@/lib/site-config";

const SITE_NAME = "Selenarium";

const AUTHOR = {
  "@type": "Person" as const,
  name: "Mihai Gavrilescu",
  alternateName: "lemagepoet",
  url: `${SITE_URL}/en/about`,
};

// ─── Renderer ─────────────────────────────────────────────

export function JsonLd({ data }: { data: Record<string, unknown> }): ReactElement {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify({ "@context": "https://schema.org", ...data }),
    },
  });
}

// ─── WebSite (home page) ──────────────────────────────────

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "A digital selenarium for contemporary poetry, photography, music and cinema by lemagepoet (Mihai Gavrilescu).",
    author: AUTHOR,
    inLanguage: ["en", "ro"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/en/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Person (about page) ──────────────────────────────────

export function personJsonLd(opts?: { image?: string }) {
  return {
    "@type": "Person",
    name: "Mihai Gavrilescu",
    alternateName: "lemagepoet",
    url: `${SITE_URL}/en/about`,
    image: opts?.image,
    jobTitle: "Poet, Photographer, Sound Artist",
    sameAs: [] as string[],
    knowsLanguage: ["Romanian", "English"],
  };
}

// ─── Article (essays) ─────────────────────────────────────

export function articleJsonLd(opts: {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  image?: string;
  category?: string;
  wordCount?: number;
}) {
  return {
    "@type": "Article",
    headline: opts.title,
    url: `${SITE_URL}/en/essays/${opts.slug}`,
    author: AUTHOR,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt ?? opts.publishedAt,
    description: opts.excerpt,
    image: opts.image,
    articleSection: opts.category,
    wordCount: opts.wordCount,
    inLanguage: "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/en/essays/${opts.slug}`,
    },
  };
}

// ─── CreativeWork (poems) ─────────────────────────────────

export function poemJsonLd(opts: {
  title: string;
  slug: string;
  excerpt?: string;
  collection?: string;
  publishedAt?: string;
  language?: string;
  image?: string;
  titleRo?: string;
  slugRo?: string;
}) {
  return {
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/en/poetry/${opts.slug}`,
    name: opts.title,
    url: `${SITE_URL}/en/poetry/${opts.slug}`,
    author: AUTHOR,
    genre: "Poetry",
    description: opts.excerpt,
    image: opts.image,
    keywords: opts.collection ?? undefined,
    alternativeHeadline: opts.titleRo ?? undefined,
    isPartOf: opts.collection
      ? { "@type": "Collection", name: opts.collection }
      : undefined,
    datePublished: opts.publishedAt,
    inLanguage: opts.language === "ro" ? ["ro", "en"] : ["en", "ro"],
    ...(opts.slugRo && opts.slugRo !== opts.slug
      ? {
          workTranslation: {
            "@type": "CreativeWork",
            name: opts.titleRo ?? opts.title,
            url: `${SITE_URL}/ro/poetry/${opts.slugRo}`,
            inLanguage: "ro",
          },
        }
      : {}),
  };
}

// ─── ImageGallery / ImageObject (photography) ─────────────

export function photoJsonLd(opts: {
  title: string;
  slug: string;
  imageUrl: string;
  description?: string;
  width?: number;
  height?: number;
  publishedAt?: string;
}) {
  return {
    "@type": "ImageObject",
    name: opts.title,
    url: `${SITE_URL}/en/photography/${opts.slug}`,
    contentUrl: opts.imageUrl.startsWith("http")
      ? opts.imageUrl
      : `${SITE_URL}${opts.imageUrl}`,
    author: AUTHOR,
    description: opts.description,
    width: opts.width,
    height: opts.height,
    datePublished: opts.publishedAt,
  };
}

export function photoSeriesJsonLd(opts: {
  name: string;
  slug: string;
  description?: string;
  photoCount: number;
}) {
  return {
    "@type": "ImageGallery",
    name: opts.name,
    url: `${SITE_URL}/en/photography/series/${opts.slug}`,
    description: opts.description,
    author: AUTHOR,
    numberOfItems: opts.photoCount,
  };
}

// ─── MusicAlbum (music) ───────────────────────────────────

export function albumJsonLd(opts: {
  title: string;
  slug: string;
  description?: string;
  year?: number;
  trackCount: number;
  coverImage?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
}) {
  return {
    "@type": "MusicAlbum",
    name: opts.title,
    url: `${SITE_URL}/en/music/${opts.slug}`,
    description: opts.description,
    byArtist: AUTHOR,
    datePublished: opts.year ? `${opts.year}` : undefined,
    numTracks: opts.trackCount,
    image: opts.coverImage,
    sameAs: [opts.spotifyUrl, opts.bandcampUrl].filter(Boolean),
  };
}

// ─── ScholarlyArticle (research) ──────────────────────────

export function researchJsonLd(opts: {
  title: string;
  slug: string;
  abstract?: string;
  publishedAt?: string;
  doi?: string;
  tags?: string[];
}) {
  return {
    "@type": "ScholarlyArticle",
    headline: opts.title,
    url: `${SITE_URL}/en/research/${opts.slug}`,
    author: AUTHOR,
    description: opts.abstract,
    datePublished: opts.publishedAt,
    sameAs: opts.doi ? `https://doi.org/${opts.doi}` : undefined,
    keywords: opts.tags?.join(", "),
  };
}

// ─── Product (shop) ───────────────────────────────────────

export function productJsonLd(opts: {
  title: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  inStock: boolean;
  currency?: string;
}) {
  return {
    "@type": "Product",
    name: opts.title,
    url: `${SITE_URL}/en/shop/${opts.slug}`,
    description: opts.description,
    image: opts.image,
    offers: {
      "@type": "Offer",
      price: opts.price,
      priceCurrency: opts.currency ?? "EUR",
      availability: opts.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/en/shop/${opts.slug}`,
    },
  };
}

// ─── Book ─────────────────────────────────────────────────

export function bookJsonLd(opts: {
  title: string;
  slug: string;
  description?: string;
  year?: number;
  coverImage?: string;
  price?: number;
}) {
  return {
    "@type": "Book",
    name: opts.title,
    url: `${SITE_URL}/en/books/${opts.slug}`,
    author: AUTHOR,
    description: opts.description,
    datePublished: opts.year ? `${opts.year}` : undefined,
    image: opts.coverImage,
    offers: opts.price
      ? {
          "@type": "Offer",
          price: opts.price,
          priceCurrency: "EUR",
        }
      : undefined,
  };
}

// ─── BreadcrumbList ───────────────────────────────────────

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// ─── CollectionPage ───────────────────────────────────────

export function collectionPageJsonLd(opts: {
  name: string;
  path: string;
  description: string;
  itemCount?: number;
}) {
  return {
    "@type": "CollectionPage",
    name: opts.name,
    url: `${SITE_URL}${opts.path}`,
    description: opts.description,
    author: AUTHOR,
    numberOfItems: opts.itemCount,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
