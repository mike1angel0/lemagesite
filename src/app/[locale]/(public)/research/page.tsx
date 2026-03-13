import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { ResearchCard } from "@/components/content/research-card";
import { ResearchFilterTabs } from "./research-filter-tabs";

const papers = [
  {
    title: "Neural Architectures and the Poetics of Attention",
    tags: ["NLP", "ATTENTION"],
    abstract:
      "This paper explores the structural parallels between poetic meter and self-attention mechanisms in transformer architectures, proposing a novel framework for understanding how both systems distribute focus across sequential inputs.",
    doi: "10.1234/arxiv.2025.0142",
    year: "2025",
    accessTier: "PATRON ONLY",
    slug: "/research/neural-architectures-poetics-attention",
  },
  {
    title: "On Machine Grief: Can Artificial Systems Experience Loss?",
    tags: ["PHILOSOPHY OF AI"],
    abstract:
      "A philosophical investigation into whether loss functions in neural networks constitute a form of computational grief, examining the phenomenology of optimization as existential process.",
    doi: "10.1234/philai.2024.0087",
    year: "2024",
    slug: "/research/on-machine-grief",
  },
  {
    title: "Generative Verse: Fine-Tuning Language Models on Poetic Corpora",
    tags: ["POETICS & ML", "NLP"],
    abstract:
      "We present a methodology for fine-tuning large language models on curated poetic corpora, evaluating the aesthetic quality of generated verse through both computational metrics and expert human evaluation.",
    doi: "10.1234/genverse.2024.0213",
    year: "2024",
    slug: "/research/generative-verse",
  },
];

export default async function ResearchPage() {
  const t = await getTranslations("research");

  return (
    <>
    {/* ── Hero ── */}
    <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-10">
      <SectionLabel label={t("sectionLabel")} className="justify-center" />

      <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary mt-6 text-center leading-tight">
        {t("heroTitle")}
      </h1>

      <p className="font-sans text-sm text-text-secondary mt-6 max-w-[560px] leading-relaxed text-center">
        {t("heroDescription")}
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
            abstract={paper.abstract}
            doi={paper.doi}
            year={paper.year}
            accessTier={paper.accessTier}
            slug={paper.slug}
          />
        ))}
      </div>
    </section>
    </>
  );
}
