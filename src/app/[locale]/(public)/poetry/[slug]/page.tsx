import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPoemBySlug, getPublishedPoems, getRelatedPoems } from "@/lib/data";
import { PoemDetailClient } from "./poem-detail-client";
import { makeMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site-config";
import { JsonLd, poemJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { ViewTracker } from "@/components/ui/view-tracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const poem = await getPoemBySlug(slug);
  if (!poem) return {};

  const displayTitle = locale === "ro" && poem.titleRo ? poem.titleRo : poem.title;
  const displayExcerpt = locale === "ro" && poem.excerptRo ? poem.excerptRo : (poem.excerpt ?? "");

  const meta = makeMetadata({
    title: displayTitle,
    description: displayExcerpt,
    path: `/poetry/${slug}`,
    locale,
    image: poem.coverImage ?? undefined,
    keywords: poem.collection ? poem.collection.split(/[,&]/).map((t: string) => t.trim()).filter(Boolean) : undefined,
  });

  // Enhanced hreflang: if poem has slugRo, link RO locale to the RO slug URL
  if (poem.slugRo && poem.slugRo !== poem.slug) {
    meta.alternates = {
      ...meta.alternates,
      languages: {
        en: `${SITE_URL}/en/poetry/${poem.slug}`,
        ro: `${SITE_URL}/ro/poetry/${poem.slugRo}`,
        "x-default": `${SITE_URL}/en/poetry/${poem.slug}`,
      },
    };
  }

  return meta;
}

export default async function PoemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const poem = await getPoemBySlug(slug);
  if (!poem) notFound();

  // Get other poems for navigation/related
  const allPoems = await getPublishedPoems();
  const currentIdx = allPoems.findIndex((p) => p.slug === slug);
  const prevPoem = currentIdx > 0 ? allPoems[currentIdx - 1] : null;
  const nextPoem = currentIdx < allPoems.length - 1 ? allPoems[currentIdx + 1] : null;
  const related = await getRelatedPoems(slug, poem.collection);
  const relatedPoems = related.map((p) => ({
    title: p.title,
    collection: p.collection ?? "",
    slug: `/poetry/${p.slug}`,
  }));

  return (
    <>
      <ViewTracker contentType="POEM" contentId={poem.id} />
      <JsonLd
        data={poemJsonLd({
          title: poem.title,
          slug: poem.slug,
          excerpt: poem.excerpt ?? undefined,
          collection: poem.collection ?? undefined,
          publishedAt: poem.publishedAt?.toISOString(),
          language: poem.language ?? undefined,
          image: poem.coverImage ?? undefined,
          titleRo: poem.titleRo ?? undefined,
          slugRo: poem.slugRo ?? undefined,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: `/${locale}` },
          { name: "Poetry", path: `/${locale}/poetry` },
          { name: locale === "ro" && poem.titleRo ? poem.titleRo : poem.title, path: `/${locale}/poetry/${slug}` },
        ])}
      />
      <PoemDetailClient
        poem={{
          id: poem.id,
          title: poem.title,
          body: poem.body,
          titleRo: poem.titleRo,
          bodyRo: poem.bodyRo,
          collection: poem.collection,
          language: poem.language,
          audioUrl: poem.audioUrl,
          audioUrlRo: poem.audioUrlRo,
          coverImage: poem.coverImage,
          accessTier: poem.accessTier,
          excerpt: poem.excerpt,
          publishedAt: poem.publishedAt?.toISOString() ?? null,
        }}
        prevSlug={prevPoem ? `/poetry/${prevPoem.slug}` : null}
        nextSlug={nextPoem ? `/poetry/${nextPoem.slug}` : null}
        relatedPoems={relatedPoems}
        locale={locale}
      />
    </>
  );
}
