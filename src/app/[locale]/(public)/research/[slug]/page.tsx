"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tocItems = [
  { label: "Abstract", id: "abstract" },
  { label: "1. Introduction", id: "introduction" },
  { label: "2. Related Work", id: "related-work" },
  { label: "3. Methodology", id: "methodology" },
  { label: "4. Results", id: "results" },
  { label: "5. Discussion", id: "discussion" },
  { label: "6. Conclusion", id: "conclusion" },
];

const relatedPapers = [
  {
    title: "Celestial Cartographies in Eminescu's Late Poetry",
    slug: "/research/celestial-cartographies",
  },
  {
    title: "Mathematical Structures in the Works of Nichita Stanescu",
    slug: "/research/mathematical-structures",
  },
  {
    title: "The Observatory as Literary Trope",
    slug: "/research/observatory-literary-trope",
  },
];

export default function ResearchDetailPage() {
  const t = useTranslations("research");
  const tc = useTranslations("common");

  return (
    <section>
      {/* -- Hero (centered) -- */}
      <div className="flex flex-col items-center gap-5 px-[200px] pt-20 pb-10">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-accent-dim">
          RESEARCH PAPER
        </span>

        <h1 className="font-serif text-[36px] font-semibold text-text-primary text-center leading-tight">
          Nocturnal Poetics: The Astronomy of Metaphor in Romanian Modernist
          Verse
        </h1>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-sans font-medium text-text-primary">
            Mihai Gavrilescu
          </span>
          <span className="text-text-muted">&middot;</span>
          <span className="font-sans italic text-text-secondary">
            Comparative Literature Studies, Vol. 61
          </span>
          <span className="text-text-muted">&middot;</span>
          <span className="font-sans text-text-secondary">2024</span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          {["Comparative Literature", "Astronomy", "Romanian Modernism"].map(
            (tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted border border-border rounded-xl px-3 py-1"
              >
                {tag}
              </span>
            ),
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="gold"
            size="md"
            onClick={() => alert("Download coming soon")}
          >
            {tc("downloadPdf")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => alert("Citation copied")}
          >
            {tc("cite")}
          </Button>
        </div>
      </div>

      {/* -- Two-column Body -- */}
      <div className="flex gap-12 px-20 py-10">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Abstract Card */}
          <Card>
            <h2
              id="abstract"
              className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-3"
            >
              ABSTRACT
            </h2>
            <p className="font-sans text-sm text-text-secondary leading-[1.8]">
              This paper examines the intersection of astronomical imagery and
              poetic metaphor in Romanian modernist poetry (1920-1945), with
              particular focus on the work of Lucian Blaga, Ion Barbu, and Tudor
              Arghezi. Through close readings and archival research, we
              demonstrate how these poets drew upon contemporary astronomical
              discoveries to construct new frameworks for understanding
              consciousness, time, and the limits of language.
            </p>
          </Card>

          {/* Section 1 */}
          <div>
            <h2
              id="introduction"
              className="font-serif text-2xl md:text-[28px] text-text-primary mb-4"
            >
              1. Introduction
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              The relationship between poetry and astronomy in Romanian
              literature has received surprisingly little scholarly attention,
              despite the rich tradition of celestial imagery that pervades the
              works of the interwar modernists. This paper seeks to address this
              gap by examining how three major poets — Blaga, Barbu, and Arghezi
              — engaged with astronomical concepts not merely as decorative
              metaphors but as structural principles for their poetic practice.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2
              id="related-work"
              className="font-serif text-2xl md:text-[28px] text-text-primary mb-4"
            >
              2. Related Work
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              Previous scholarship has touched upon astronomical imagery in
              Romanian poetry only tangentially. Călinescu&apos;s seminal history
              mentions Blaga&apos;s &ldquo;cosmic metaphors&rdquo; but does not
              explore their astronomical specificity. More recently, Pop (2018)
              examined celestial imagery in Barbu&apos;s mathematical poetry,
              though without connecting it to contemporaneous astronomical
              discoveries.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2
              id="methodology"
              className="font-serif text-2xl md:text-[28px] text-text-primary mb-4"
            >
              3. Methodology
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              Our methodology combines close reading with archival research into
              the poets&apos; personal libraries and correspondence. We
              catalogued all astronomical references across the complete works of
              Blaga, Barbu, and Arghezi, then cross-referenced these with
              astronomical publications available in Romania during the interwar
              period.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2
              id="results"
              className="font-serif text-2xl md:text-[28px] text-text-primary mb-4"
            >
              4. Results
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              We identified 247 distinct astronomical references across the
              three poets&apos; works. Blaga&apos;s usage was predominantly
              cosmological, employing images of nebulae and stellar formation to
              explore consciousness. Barbu&apos;s references were more
              geometric, drawing on orbital mechanics and celestial coordinates.
              Arghezi&apos;s astronomical imagery, by contrast, was deeply
              personal and often nocturnal.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2
              id="discussion"
              className="font-serif text-2xl md:text-[28px] text-text-primary mb-4"
            >
              5. Discussion
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              These findings suggest that Romanian modernist poets were not
              merely decorating their verse with celestial imagery, but actively
              engaging with astronomical concepts as frameworks for poetic
              innovation. The observatory — both literal and metaphorical —
              served as a site where scientific observation and poetic vision
              converged.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2
              id="conclusion"
              className="font-serif text-2xl md:text-[28px] text-text-primary mb-4"
            >
              6. Conclusion
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              The astronomy of metaphor in Romanian modernist verse reveals a
              sophisticated dialogue between scientific and poetic epistemologies.
              By reading these poets through the lens of their astronomical
              sources, we gain new insight into how they understood the
              relationship between observation, language, and the limits of human
              knowledge.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-[280px] shrink-0 flex flex-col gap-5">
          {/* TOC */}
          <Card padding="p-5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              TABLE OF CONTENTS
            </span>
            <nav className="flex flex-col gap-2.5 mt-3">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </Card>

          {/* Citation Block */}
          <Card padding="p-5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              CITE THIS PAPER
            </span>
            <p className="font-mono text-[11px] text-text-secondary mt-3 leading-relaxed">
              Gavrilescu, M. (2024). Nocturnal Poetics: The Astronomy of
              Metaphor in Romanian Modernist Verse.{" "}
              <em>Comparative Literature Studies</em>, 61(2), 245-278. DOI:
              10.1234/cls.2024.061
            </p>
          </Card>

          {/* Related Papers */}
          <Card padding="p-5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              RELATED PAPERS
            </span>
            <div className="flex flex-col gap-3 mt-3">
              {relatedPapers.map((paper) => (
                <Link
                  key={paper.slug}
                  href={paper.slug}
                  className="font-serif text-sm text-text-primary hover:text-warm-ivory transition-colors"
                >
                  {paper.title}
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}
