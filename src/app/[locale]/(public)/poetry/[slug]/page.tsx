import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPoemBySlug, getPublishedPoems, getRelatedPoems } from "@/lib/data";
import { PoemDetailClient } from "./poem-detail-client";
import { makeMetadata } from "@/lib/seo/metadata";
import { JsonLd, poemJsonLd } from "@/lib/seo/jsonld";
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

  return makeMetadata({
    title: displayTitle,
    description: displayExcerpt,
    path: `/poetry/${slug}`,
    locale,
  });
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
        })}
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
