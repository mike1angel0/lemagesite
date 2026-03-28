import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPhotoBySlug, getPublishedPhotos } from "@/lib/data";
import { PhotoActionBar } from "@/components/ui/photo-action-bar";

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("photography");
  const tc = await getTranslations("common");

  const photo = await getPhotoBySlug(slug);
  if (!photo) notFound();

  const allPhotos = await getPublishedPhotos();
  const currentIdx = allPhotos.findIndex((p) => p.slug === slug);
  const total = allPhotos.length;

  const exifData = (photo.exifData as Record<string, string> | null) ?? {};

  return (
    <article>
      {/* -- Top bar -- */}
      <div className="flex items-center justify-between px-5 md:px-20 py-4">
        <Link
          href="/photography"
          className="inline-flex items-center gap-2 font-sans text-xs text-accent-dim hover:text-accent transition-colors"
        >
          <span className="text-sm">←</span>
          {t("backToGallery")}
        </Link>
        <div className="flex items-center gap-3">
          {currentIdx > 0 && (
            <Link
              href={`/photography/${allPhotos[currentIdx - 1].slug}`}
              className="font-sans text-xs text-text-muted hover:text-accent transition-colors"
            >
              ← {tc("previous")}
            </Link>
          )}
          <span className="font-mono text-[11px] text-text-secondary tracking-[1px]">
            {currentIdx + 1} / {total}
          </span>
          {currentIdx < total - 1 && (
            <Link
              href={`/photography/${allPhotos[currentIdx + 1].slug}`}
              className="font-sans text-xs text-accent hover:text-accent-dim transition-colors"
            >
              {tc("next")} →
            </Link>
          )}
        </div>
      </div>

      {/* -- Image frame -- */}
      <div className="w-full h-[780px] bg-black px-5 md:px-20 py-6 relative">
        <Image src={photo.imageUrl} alt={photo.title} fill className="object-contain" />
      </div>

      {/* -- Below image -- */}
      <div className="flex gap-20 px-5 md:px-20 py-12">
        {/* Main info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="font-serif text-[32px] font-light text-text-primary leading-tight">
            {photo.title}
          </h1>
          {photo.description && (
            <p className="font-sans text-sm text-text-secondary leading-[1.7]">
              {photo.description}
            </p>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-[280px] shrink-0 flex flex-col gap-5">
          {/* EXIF block */}
          <div className="flex flex-col gap-3">
            {[
              { label: tc("camera"), value: exifData.camera ?? "—" },
              { label: tc("year"), value: exifData.year || (photo.publishedAt ? new Date(photo.publishedAt).getFullYear().toString() : "—") },
              { label: tc("location"), value: exifData.location ?? "—" },
              { label: tc("series"), value: photo.series?.name ?? "—" },
              { label: tc("print"), value: t("availableLimited") },
            ].map((entry) => (
              <div
                key={entry.label}
                className="flex justify-between items-baseline"
              >
                <span className="font-mono text-[10px] text-text-muted tracking-[1px] uppercase">
                  {entry.label}
                </span>
                <span className="font-sans text-xs text-text-secondary">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>

          {/* Member badge */}
          {photo.accessTier !== "FREE" && (
            <div className="inline-flex items-center gap-2 bg-bg-elevated border border-border rounded px-3 py-1.5 w-fit">
              <span className="font-mono text-[9px] text-gold tracking-[1px] uppercase">
                {photo.accessTier}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Share / Export action bar */}
      <PhotoActionBar
        photoId={photo.id}
        title={photo.title}
        description={photo.description}
        imageUrl={photo.imageUrl}
        prevSlug={currentIdx > 0 ? `/photography/${allPhotos[currentIdx - 1].slug}` : null}
        nextSlug={currentIdx < total - 1 ? `/photography/${allPhotos[currentIdx + 1].slug}` : null}
        prevLabel={tc("previous")}
        nextLabel={tc("next")}
      />
    </article>
  );
}
