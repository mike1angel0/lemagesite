import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { PoemCard } from "@/components/content/poem-card";
import { PoetryFilterTabs } from "./poetry-filter-tabs";
import { getPublishedPoems, getPageContent } from "@/lib/data";
import { PLACEHOLDER } from "@/lib/placeholders";
import { RotatingQuote } from "@/components/content/rotating-quote";

export default async function PoetryPage() {
  const t = await getTranslations("poetry");
  const locale = await getLocale();
  const content = await getPageContent("poetry", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const poems = await getPublishedPoems();

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-16">
        <SectionLabel label={content.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary leading-[1.15] max-w-[700px] mt-6 text-center whitespace-pre-line">
          {content.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary mt-6 max-w-[600px] leading-relaxed text-center">
          {content.heroDescription}
        </p>

        {/* Filter Tabs */}
        <div className="mt-6">
          <PoetryFilterTabs />
        </div>
      </section>

      {/* ── Poems List ── */}
      <section className="px-5 md:px-10 xl:px-20 pb-20">
        {poems.map((poem) => (
          <PoemCard
            key={poem.slug}
            title={poem.title}
            collection={(poem.collection ?? "").toUpperCase()}
            language={(poem.language ?? "EN").toUpperCase()}
            excerpt={poem.excerpt ?? ""}
            accessTier={poem.accessTier !== "FREE" ? poem.accessTier : undefined}
            hasAudio={!!poem.audioUrl}
            slug={`/poetry/${poem.slug}`}
          />
        ))}
      </section>

      {/* ── Quote Interlude ── */}
      <RotatingQuote
        fallbackQuote={t("quoteText")}
        fallbackAuthor={t("quoteAuthor")}
      />
    </>
  );
}
