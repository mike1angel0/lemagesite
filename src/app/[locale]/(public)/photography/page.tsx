import Link from "next/link";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { PhotographyFilterTabs } from "./photography-filter-tabs";
import { getPublishedPhotos, getPageContent } from "@/lib/data";

function PhotoCard({
  photo,
  className,
  uncategorizedLabel,
}: {
  photo: { title: string; slug: string; imageUrl: string; series?: { name: string } | null };
  className: string;
  uncategorizedLabel: string;
}) {
  return (
    <Link href={`/photography/${photo.slug}`} className={className}>
      <Image src={photo.imageUrl} alt={photo.title} fill className="object-cover" />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="font-serif text-lg text-warm-ivory">
          {photo.title}
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
          {photo.series?.name ?? uncategorizedLabel}
        </span>
      </div>
    </Link>
  );
}

export default async function PhotographyPage() {
  const t = await getTranslations("photography");
  const locale = await getLocale();
  const content = await getPageContent("photography", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const photos = await getPublishedPhotos();

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-16">
        <SectionLabel label={content.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary leading-[1.15] max-w-[600px] mt-6 text-center whitespace-pre-line">
          {content.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary mt-6 max-w-[560px] leading-relaxed text-center">
          {content.heroDescription}
        </p>
      </section>

      {/* ── Series Filter ── */}
      <section className="flex justify-center gap-8 px-5 md:px-10 xl:px-20 pb-10">
        <PhotographyFilterTabs />
      </section>

      {/* ── Gallery Grid ── */}
      <section className="px-5 md:px-10 xl:px-20 pb-20">
        {photos.length >= 7 ? (
          <>
            {/* Row 1: 2 columns, equal width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[0]}
                className="h-[420px] bg-bg-surface border border-border rounded overflow-hidden relative group cursor-pointer block"
              />
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[1]}
                className="h-[420px] bg-bg-surface border border-border rounded overflow-hidden relative group cursor-pointer block"
              />
            </div>

            {/* Row 2: 3 columns */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[2]}
                className="h-[350px] flex-1 bg-bg-surface border border-border overflow-hidden relative group cursor-pointer block"
              />
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[3]}
                className="h-[350px] md:w-[420px] shrink-0 bg-bg-surface border border-border overflow-hidden relative group cursor-pointer block"
              />
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[4]}
                className="h-[350px] flex-1 bg-bg-surface border border-border overflow-hidden relative group cursor-pointer block"
              />
            </div>

            {/* Row 3: 2 columns */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[5]}
                className="h-[420px] md:w-[420px] shrink-0 bg-bg-surface border border-border overflow-hidden relative group cursor-pointer block"
              />
              <PhotoCard
                uncategorizedLabel={t("uncategorized")}
                photo={photos[6]}
                className="h-[420px] flex-1 bg-bg-surface border border-border overflow-hidden relative group cursor-pointer block"
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.slug}
                uncategorizedLabel={t("uncategorized")}
                photo={photo}
                className="h-[350px] bg-bg-surface border border-border rounded overflow-hidden relative group cursor-pointer block"
              />
            ))}
          </div>
        )}

        {/* Note */}
        <p className="font-sans text-xs text-text-muted text-center mt-8">
          {t("galleryNote")}
        </p>
      </section>
    </>
  );
}
