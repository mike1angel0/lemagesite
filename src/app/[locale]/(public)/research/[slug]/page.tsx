import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { ResearchActionBar } from "@/components/ui/research-action-bar";
import { getResearchBySlug, getPublishedResearch, getRelatedResearch } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";
import { MarkdownBody } from "@/components/content/markdown-body";
import { makeMetadata } from "@/lib/seo/metadata";
import { JsonLd, researchJsonLd } from "@/lib/seo/jsonld";
import { ReadAloudButton } from "@/components/ui/read-aloud-button";
import { ScrollPositionTracker } from "@/components/ui/scroll-position-tracker";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { ViewTracker } from "@/components/ui/view-tracker";
import { CommentsSection } from "@/components/content/comments-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const paper = await getResearchBySlug(slug);
  if (!paper) return {};

  const readTime = paper.body
    ? Math.max(1, Math.ceil(paper.body.split(/\s+/).length / 200))
    : undefined;

  return makeMetadata({
    title: paper.title,
    description: paper.abstract ?? "",
    path: `/research/${slug}`,
    image: paper.coverImage ?? undefined,
    type: "article",
    publishedAt: paper.publishedAt?.toISOString(),
    locale,
    readTime,
  });
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("research");
  const tc = await getTranslations("common");
  const te = await getTranslations("essays");
  const locale = await getLocale();

  const [paper, config] = await Promise.all([getResearchBySlug(slug), getSiteConfig()]);
  if (!paper) notFound();

  const allPapers = await getPublishedResearch();
  const currentIndex = allPapers.findIndex((p) => p.slug === slug);
  const prevPaper = currentIndex > 0 ? allPapers[currentIndex - 1] : null;
  const nextPaper = currentIndex < allPapers.length - 1 ? allPapers[currentIndex + 1] : null;
  const relatedPapers = await getRelatedResearch(slug, paper.tags);

  return (
    <section>
      <JsonLd
        data={researchJsonLd({
          title: paper.title,
          slug: paper.slug,
          abstract: paper.abstract ?? undefined,
          publishedAt: paper.publishedAt?.toISOString(),
          doi: paper.doi ?? undefined,
          tags: paper.tags,
        })}
      />

      <ViewTracker contentType="RESEARCH" contentId={paper.id} />
      <ScrollPositionTracker slug={`research-${slug}`} />

      {/* -- Hero Image -- */}
      {paper.coverImage && (
        <div className="w-full h-[320px] bg-bg-surface relative">
          <Image
            src={paper.coverImage}
            alt={paper.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </div>
      )}

      {/* -- Hero (centered) -- */}
      <div className={`flex flex-col items-center gap-5 px-5 md:px-[200px] pb-10 ${paper.coverImage ? "-mt-24 relative z-10 pt-0" : "pt-20"}`}>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-accent-dim">
          {t("researchPaperLabel")}
        </span>

        <h1 className="font-serif text-[36px] font-semibold text-text-primary text-center leading-tight">
          {paper.title}
        </h1>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-sans font-medium text-text-primary">
            {config.authorName}
          </span>
          {paper.doi && (
            <>
              <span className="text-text-muted">&middot;</span>
              <span className="font-sans text-text-secondary">
                DOI: {paper.doi}
              </span>
            </>
          )}
          {paper.year && (
            <>
              <span className="text-text-muted">&middot;</span>
              <span className="font-sans text-text-secondary">{paper.year}</span>
            </>
          )}
        </div>

        {/* Tags */}
        {paper.tags.length > 0 && (
          <div className="flex items-center gap-2">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted border border-border rounded-xl px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              className="inline-flex items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-medium text-bg hover:bg-gold/90 transition-colors"
            >
              {tc("downloadPdf")}
            </a>
          )}
        </div>

        {/* Read Aloud */}
        <ReadAloudButton contentType="RESEARCH" contentId={paper.id} audioUrl={paper.audioUrl} audioUrlRo={paper.audioUrlRo} locale={locale} />
      </div>

      {/* -- Two-column Body -- */}
      <div className="flex gap-12 px-5 md:px-20 py-10">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Abstract Card */}
          {paper.abstract && (
            <Card>
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-3">
                {tc("abstract")}
              </h2>
              <p className="font-sans text-sm text-text-secondary leading-[1.8]">
                {paper.abstract}
              </p>
            </Card>
          )}

          {/* Body content */}
          {paper.body && <MarkdownBody content={paper.body} />}

          {/* References */}
          {paper.references && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-4">
                {tc("references")}
              </h2>
              <div className="prose-sm">
                <MarkdownBody content={paper.references} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-[280px] shrink-0 flex flex-col gap-5">
          {/* Citation Block */}
          <Card padding="p-5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              {tc("citeThisPaper")}
            </span>
            <p className="font-mono text-[11px] text-text-secondary mt-3 leading-relaxed">
              {config.authorName.split(" ").pop()}, {config.authorName.charAt(0)}. ({paper.year ?? "n.d."}). {paper.title}.
              {paper.doi ? ` DOI: ${paper.doi}` : ""}
            </p>
          </Card>

          {/* Related Papers */}
          {relatedPapers.length > 0 && (
            <Card padding="p-5">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
                {tc("relatedPapers")}
              </span>
              <div className="flex flex-col gap-3 mt-3">
                {relatedPapers.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/research/${p.slug}`}
                    className="font-serif text-sm text-text-primary hover:text-warm-ivory transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>

      {/* -- Action bar -- */}
      <div className="border-t border-border">
        <ResearchActionBar
          paperId={paper.id}
          title={paper.title}
          abstract={paper.abstract ?? ""}
          year={paper.year?.toString() ?? ""}
          bgImage={paper.coverImage ?? undefined}
          prevSlug={prevPaper ? `/research/${prevPaper.slug}` : null}
          nextSlug={nextPaper ? `/research/${nextPaper.slug}` : null}
          prevLabel={tc("previous")}
          nextLabel={tc("next")}
        />
      </div>

      {/* -- Comments -- */}
      <div className="px-5 md:px-20">
        <CommentsSection contentType="RESEARCH" contentId={paper.id} />
      </div>

      {/* -- Newsletter CTA -- */}
      <div className="py-10 border-t border-border text-center px-5 md:px-20">
        <h3 className="font-serif text-xl text-text-primary mb-2">
          {te("newsletterHeadline")}
        </h3>
        <p className="font-sans text-sm text-text-secondary mb-6">
          {te("newsletterDescription")}
        </p>
        <div className="flex justify-center">
          <NewsletterForm source="research-footer" />
        </div>
      </div>
    </section>
  );
}
