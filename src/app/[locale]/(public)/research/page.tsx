import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { ResearchCard } from "@/components/content/research-card";
import { ResearchFilterTabs } from "./research-filter-tabs";
import { getPublishedResearch, getPageContent } from "@/lib/data";

export default async function ResearchPage() {
  const t = await getTranslations("research");
  const locale = await getLocale();
  const content = await getPageContent("research", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const papers = await getPublishedResearch();

  return (
    <>
    {/* ── Hero ── */}
    <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-10">
      <SectionLabel label={content.sectionLabel} className="justify-center" />

      <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary mt-6 text-center leading-tight">
        {content.heroTitle}
      </h1>

      <p className="font-sans text-sm text-text-secondary mt-6 max-w-[560px] leading-relaxed text-center">
        {content.heroDescription}
      </p>

      {/* Filter Tabs */}
      <div className="mt-6">
        <ResearchFilterTabs />
      </div>
    </section>

    {/* ── Papers List ── */}
    <section className="px-5 md:px-10 xl:px-20 pb-20">
      <div className="divide-y-0">
        {papers.map((paper) => (
          <ResearchCard
            key={paper.slug}
            title={paper.title}
            tags={paper.tags}
            abstract={paper.abstract ?? ""}
            doi={paper.doi ?? undefined}
            year={paper.year ? String(paper.year) : ""}
            accessTier={paper.accessTier !== "FREE" ? paper.accessTier : undefined}
            slug={`/research/${paper.slug}`}
          />
        ))}
      </div>
    </section>
    </>
  );
}
