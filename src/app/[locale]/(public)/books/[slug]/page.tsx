"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookCard } from "@/components/content/book-card";

const tocChapters = [
  "I. The Cartographers of Silence",
  "II. Neural Lullaby",
  "III. Scrisoare catre nimeni",
  "IV. Selenarium Notes, December",
  "V. Attention Is All You Need (To Grieve)",
  "VI. Fog Study No. 3",
  "VII. Night Transmission",
];

const relatedBooks = [
  {
    title: "Cartographies of Breath",
    coverImage: "/images/books/cartographies-of-breath.jpg",
    type: "Chapbook",
    year: "2023",
    description: "A limited-edition chapbook exploring the geography of the body.",
    slug: "/books/cartographies-of-breath",
  },
  {
    title: "Machines & Mirrors",
    coverImage: "/images/books/machines-and-mirrors.jpg",
    type: "Anthology",
    year: "2024",
    description: "An anthology of poems, essays, and research fragments on AI.",
    slug: "/books/machines-and-mirrors",
  },
  {
    title: "The Quiet Architectures",
    coverImage: "/images/books/quiet-architectures.jpg",
    type: "Poetry Collection",
    year: "2022",
    description: "Early poems on silence, space, and the structures we build from absence.",
    slug: "/books/the-quiet-architectures",
  },
];

export default function BookDetailPage() {
  const t = useTranslations("books");
  const tc = useTranslations("common");

  return (
    <section className="px-5 md:px-10 xl:px-20 py-12">
      {/* -- Back Link -- */}
      <Link
        href="/books"
        className="inline-flex items-center gap-2 font-sans text-xs text-text-muted hover:text-text-primary transition-colors"
      >
        <span className="text-sm">←</span>
        {t("backToBooks")}
      </Link>

      {/* -- Hero -- */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-16 mt-8">
        {/* Cover Image Placeholder */}
        <div className="w-full md:w-[420px] h-[600px] bg-bg-surface rounded shrink-0" />

        {/* Info Column */}
        <div className="flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[3px] text-accent-dim">
            POETRY COLLECTION &middot; 2025 &middot; FIRST EDITION
          </span>

          <h1 className="font-serif text-4xl md:text-[52px] font-light text-text-primary mt-3 leading-tight">
            Nocturnal Echoes
          </h1>

          <p className="font-sans text-sm text-text-secondary mt-2">
            by Mihai Gavrilescu
          </p>

          <p className="font-sans text-sm text-text-secondary mt-6 max-w-lg leading-[1.7]">
            47 poems on silence, machines, and the weight of unsaid words. This
            first edition features hand-numbered copies with original sketches
            and marginalia not found in the digital version. The collection
            explores the liminal spaces between language and silence, mapping the
            territories where words dissolve into something more essential.
          </p>

          <blockquote className="font-serif text-base italic text-accent-glow mt-4 leading-[1.6]">
            &ldquo;A stunning meditation on intelligence, silence, and the
            architecture of the unsaid. Gavrilescu writes like someone drawing
            constellations in dark water.&rdquo;{"\n"}&mdash; Literary Review
          </blockquote>

          {/* Price */}
          <p className="font-serif text-[32px] font-bold text-gold mt-6">
            &euro;24
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button variant="filled" size="lg" asChild>
              <Link href="/shop/nocturnal-echoes">{tc("buyPrint")}</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="#excerpt">{tc("readExcerpt")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* -- TOC & Excerpt + Specs -- */}
      <div className="flex flex-col md:flex-row gap-16 mt-16">
        {/* Left column: TOC + Excerpt */}
        <div className="flex-1 flex flex-col gap-8">
          {/* TOC */}
          <div className="border-t border-border pt-8">
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-5">
              {tc("tableOfContents").toUpperCase()}
            </h3>
            <div className="flex flex-col gap-2">
              {tocChapters.map((chapter) => (
                <span
                  key={chapter}
                  className="font-sans text-sm text-text-secondary"
                >
                  {chapter}
                </span>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div id="excerpt" className="border-t border-border pt-8">
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-5">
              EXCERPT
            </h3>
            <h2 className="font-serif text-2xl md:text-[28px] text-text-primary mb-4">
              I. The Cartographers of Silence
            </h2>
            <div className="font-serif text-lg text-text-secondary leading-[1.8] space-y-6">
              <p>
                We drew maps of the quiet places,<br />
                charted the distance between one breath and the next,<br />
                named the silences after constellations<br />
                no one had seen.
              </p>
              <p>
                In the margins we wrote coordinates<br />
                for feelings that have no address --<br />
                the ache of a word half-translated,<br />
                the hum of a machine learning to forget.
              </p>
            </div>

            {/* Excerpt action buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("Download coming soon")}
              >
                Download PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("Citation copied")}
              >
                Cite
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("Share coming soon")}
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Right column: Specs + Shipping */}
        <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-6">
          <Card>
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-4">
              {tc("specifications").toUpperCase()}
            </h3>
            <div className="space-y-3">
              {[
                { label: tc("format"), value: "Hardcover" },
                { label: tc("pages"), value: "128" },
                { label: tc("language"), value: "English / Romanian" },
                { label: tc("isbn"), value: "978-606-XXXX-XX-X" },
                { label: tc("publisher"), value: "Nemira" },
                { label: tc("year"), value: "2025" },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-[1px]">
                    {spec.label}
                  </span>
                  <span className="font-sans text-xs text-text-secondary">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-4">
              SHIPPING
            </h3>
            <div className="space-y-2">
              <p className="font-sans text-xs text-text-secondary">
                Free shipping within EU
              </p>
              <p className="font-sans text-xs text-text-secondary">
                Ships within 3-5 business days
              </p>
              <p className="font-sans text-xs text-text-secondary">
                Worldwide shipping available
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* -- Related Books -- */}
      <div className="mt-20 pt-12 border-t border-border">
        <SectionLabel label={t("moreBooks").toUpperCase()} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {relatedBooks.map((book) => (
            <BookCard
              key={book.slug}
              title={book.title}
              coverImage={book.coverImage}
              type={book.type}
              year={book.year}
              description={book.description}
              slug={book.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
