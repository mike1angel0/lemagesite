import { notFound } from "next/navigation";
import { getPoemBySlug, getPublishedPoems } from "@/lib/data";
import { PoemDetailClient } from "./poem-detail-client";

export default async function PoemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);
  if (!poem) notFound();

  // Get other poems for navigation/related
  const allPoems = await getPublishedPoems();
  const currentIdx = allPoems.findIndex((p) => p.slug === slug);
  const prevPoem = currentIdx > 0 ? allPoems[currentIdx - 1] : null;
  const nextPoem = currentIdx < allPoems.length - 1 ? allPoems[currentIdx + 1] : null;
  const relatedPoems = allPoems
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({ title: p.title, collection: p.collection ?? "", slug: `/poetry/${p.slug}` }));

  return (
    <PoemDetailClient
      poem={{
        id: poem.id,
        title: poem.title,
        body: poem.body,
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
    />
  );
}
