import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { PoemCard } from "@/components/content/poem-card";
import { PoetryFilterTabs } from "./poetry-filter-tabs";

const poems = [
  {
    title: "The Cartographers of Silence",
    collection: "SILENCE & SPACE",
    language: "EN",
    excerpt:
      "We drew maps of the quiet places, charted the distance between one breath and the next...",
    hasAudio: true,
    slug: "/poetry/the-cartographers-of-silence",
  },
  {
    title: "Neural Lullaby",
    collection: "INTELLIGENCE",
    language: "EN",
    excerpt:
      "Sleep, little algorithm, in your nest of weights and biases...",
    accessTier: "SUPPORTER",
    hasAudio: false,
    slug: "/poetry/neural-lullaby",
  },
  {
    title: "Scrisoare catre nimeni",
    collection: "LONGING",
    language: "RO",
    excerpt:
      "Am scris aceasta scrisoare in intuneric, cu cerneala facuta din uitare...",
    hasAudio: false,
    slug: "/poetry/scrisoare-catre-nimeni",
  },
  {
    title: "Attention Is All You Need (To Grieve)",
    collection: "INTELLIGENCE",
    language: "EN",
    excerpt:
      "The transformer attends to every token of your absence, weighted by how much it hurts...",
    accessTier: "PATRON ONLY",
    hasAudio: true,
    slug: "/poetry/attention-is-all-you-need-to-grieve",
  },
  {
    title: "Selenarium Notes, December",
    collection: "SILENCE & SPACE",
    language: "EN / RO",
    excerpt:
      "Tonight the telescope points inward. The stars are just reminders...",
    hasAudio: false,
    slug: "/poetry/selenarium-notes-december",
  },
];

export default async function PoetryPage() {
  const t = await getTranslations("poetry");

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-16">
        <SectionLabel label={t("sectionLabel")} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary leading-[1.15] max-w-[700px] mt-6 text-center whitespace-pre-line">
          {t("heroTitle")}
        </h1>

        <p className="font-sans text-sm text-text-secondary mt-6 max-w-[600px] leading-relaxed text-center">
          {t("heroDescription")}
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
            collection={poem.collection}
            language={poem.language}
            excerpt={poem.excerpt}
            accessTier={poem.accessTier}
            hasAudio={poem.hasAudio}
            slug={poem.slug}
          />
        ))}
      </section>

      {/* ── Quote Interlude ── */}
      <section className="h-[280px] relative overflow-hidden flex items-center justify-center">
        {/* Background image placeholder */}
        <div className="absolute inset-0 bg-bg-surface" />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/50 to-bg/85" />

        <div className="relative flex flex-col items-center gap-4 px-[200px] text-center">
          <blockquote className="font-serif text-xl font-light text-text-primary leading-[1.7] max-w-[560px]">
            &ldquo;{t("quoteText")}&rdquo;
          </blockquote>
          <p className="font-mono text-[10px] tracking-[2px] text-accent-dim">
            &mdash; {t("quoteAuthor")}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-40" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-40" />
          </div>
        </div>
      </section>
    </>
  );
}
