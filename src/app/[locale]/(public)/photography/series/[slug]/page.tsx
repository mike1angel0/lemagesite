import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { getSeriesBySlug } from "@/lib/data";
import { PLACEHOLDER } from "@/lib/placeholders";

interface SeriesDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function SeriesDetailPage({
  params,
}: SeriesDetailPageProps) {
  const { slug } = await params;
  const t = await getTranslations("photography");
  const tc = await getTranslations("common");

  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  const photos = series.photos;

  return (
    <article>
      {/* -- Hero image with overlay -- */}
      <section className="w-full h-[500px] relative overflow-hidden">
        <Image
          src={series.coverImage ?? PLACEHOLDER.photo}
          alt=""
          fill
          className="object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828]/60 to-transparent" />

        {/* Content over hero */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-20 pb-12 gap-4">
          <SectionLabel label={t("seriesLabel")} />

          <h1 className="font-serif text-4xl md:text-[52px] font-light text-warm-ivory leading-tight">
            {series.name}
          </h1>

          {series.description && (
            <p className="font-sans text-[15px] text-text-secondary leading-[1.6] max-w-[600px]">
              {series.description}
            </p>
          )}

          <div className="flex items-center gap-8 font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
            <span>
              {photos.length} {tc("photographs").toLowerCase()}
            </span>
          </div>
        </div>
      </section>

      {/* -- Photo grid -- */}
      <section className="px-5 md:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Link
              key={photo.slug}
              href={`/photography/${photo.slug}`}
              className="group"
            >
              <div className="h-[300px] bg-bg-surface rounded-sm overflow-hidden relative">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-sans text-sm text-text-secondary mt-2 group-hover:text-text-primary transition-colors">
                {photo.title}
              </p>
            </Link>
          ))}
        </div>

        {photos.length === 0 && (
          <p className="font-sans text-sm text-text-muted text-center py-12">
            {t("uncategorized")}
          </p>
        )}
      </section>

      {/* -- Artist's note -- */}
      <section className="flex flex-col items-center gap-6 border-t border-border px-5 md:px-[200px] py-12">
        <h2 className="font-serif text-[28px] font-light text-warm-ivory">
          {tc("artistsNote")}
        </h2>
        {series.description && (
          <p className="font-sans text-sm text-text-secondary leading-[1.7] text-center max-w-[520px]">
            {series.description}
          </p>
        )}
      </section>
    </article>
  );
}
