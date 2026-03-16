import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { EssayCard } from "@/components/content/essay-card";
import { EssayActionBarNew } from "@/components/ui/essay-action-bar-new";
import { getEssayBySlug, getPublishedEssays } from "@/lib/data";
import { MarkdownBody } from "@/components/content/markdown-body";

export default async function EssayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("essays");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  const essay = await getEssayBySlug(slug);
  if (!essay) notFound();

  const allEssays = await getPublishedEssays();
  const currentIndex = allEssays.findIndex((e) => e.slug === slug);
  const prevEssay = currentIndex > 0 ? allEssays[currentIndex - 1] : null;
  const nextEssay = currentIndex < allEssays.length - 1 ? allEssays[currentIndex + 1] : null;
  const relatedEssays = allEssays
    .filter((e) => e.slug !== slug)
    .slice(0, 3);

  // Generate TOC from markdown headings (## Heading)
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  const tocItems: { label: string; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(essay.body)) !== null) {
    const label = match[1].trim();
    const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    tocItems.push({ label, id });
  }

  const publishedDate = essay.publishedAt
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(essay.publishedAt)
    : "";

  return (
    <>
      {/* -- Hero Image -- */}
      <div className="w-full h-[480px] bg-bg-surface relative">
        {essay.thumbnail && (
          <Image
            src={essay.thumbnail}
            alt={essay.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      </div>

      {/* -- Title & Meta -- */}
      <section className="px-5 md:px-10 xl:px-20 py-12 -mt-32 relative z-10">
        <span className="font-mono text-[9px] uppercase tracking-[2px] text-accent-dim">
          {(essay.category ?? "ESSAY").toUpperCase()}
        </span>

        <h1 className="font-serif text-3xl md:text-[44px] font-light text-text-primary mt-3 leading-[1.2] max-w-[800px]">
          {essay.title}
        </h1>

        <div className="flex items-center gap-4 mt-4 font-mono text-[10px] text-text-muted tracking-[1px]">
          <span>{(essay.category ?? "").toUpperCase()}</span>
          <span>&middot;</span>
          <span>{essay.readTime ? `${essay.readTime} ${t("minRead").toLowerCase()}` : ""}</span>
          <span>&middot;</span>
          <span>{publishedDate}</span>
        </div>

        {/* -- Two-column Body -- */}
        <div className="flex flex-col md:flex-row gap-16 mt-12">
          {/* Sidebar TOC */}
          {tocItems.length > 0 && (
            <aside className="hidden md:block w-[200px] shrink-0">
              <span className="font-mono text-[10px] text-text-muted tracking-[3px] uppercase">
                {tc("tableOfContents").toUpperCase()}
              </span>
              <nav className="flex flex-col gap-6 mt-6">
                {tocItems.map((item, i) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`font-sans text-xs leading-[1.5] transition-colors ${
                      i === 0
                        ? "text-accent hover:text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <article className="flex-1 max-w-2xl">
            <MarkdownBody content={essay.body} />
          </article>
        </div>

        {/* -- Tags -- */}
        {essay.category && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
            {essay.category.split(/[,&]/).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted border border-border px-3 py-1"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* -- Share & Image Row -- */}
        <div className="mt-6">
          <EssayActionBarNew
            essayId={essay.id}
            title={essay.title}
            excerpt={essay.excerpt ?? ""}
            body={essay.body}
            category={essay.category ?? ""}
            readTime={essay.readTime ? `${essay.readTime} ${t("minRead").toLowerCase()}` : ""}
            bgImage={essay.thumbnail ?? undefined}
            prevSlug={prevEssay ? `/essays/${prevEssay.slug}` : null}
            nextSlug={nextEssay ? `/essays/${nextEssay.slug}` : null}
            prevLabel={tc("previous")}
            nextLabel={tc("next")}
          />
        </div>

        {/* -- Partner Callout -- */}
        <div className="flex justify-center py-6">
          <Link href="/membership" className="flex items-center gap-3 bg-bg-card border border-border rounded-lg px-6 py-4 hover:border-gold/50 transition-colors">
            <span className="text-gold">&#9998;</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-mono text-[10px] text-gold tracking-[2px] uppercase">
                {t("partnerBadge")}
              </p>
              <p className="font-sans text-xs text-text-secondary">
                {t("partnerDescription")}
              </p>
            </div>
          </Link>
        </div>

        {/* -- Related Essays -- */}
        {relatedEssays.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <SectionLabel label={t("relatedEssays").toUpperCase()} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {relatedEssays.map((e) => (
                <EssayCard
                  key={e.slug}
                  title={e.title}
                  category={(e.category ?? "").toUpperCase()}
                  excerpt={e.excerpt ?? ""}
                  readTime={e.readTime ? `${e.readTime} ${t("min")}` : ""}
                  slug={`/essays/${e.slug}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
