import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { getSiteConfig } from "@/lib/site-config";
import { SectionLabel } from "@/components/ui/section-label";
import Link from "next/link";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { getPublishedEssays, getPageContent } from "@/lib/data";
import { PLACEHOLDER } from "@/lib/placeholders";

export default async function EssaysPage() {
  const t = await getTranslations("essays");
  const locale = await getLocale();
  const content = await getPageContent("essays", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const essays = await getPublishedEssays();

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-10 gap-6">
        <SectionLabel label={content.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary whitespace-pre-line text-center leading-[1.15] max-w-[600px]">
          {content.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          {content.heroDescription}
        </p>
      </section>

      {/* ── Essays List ── */}
      <section className="px-5 md:px-10 xl:px-20">
        {essays.map((essay) => (
          <Link
            key={essay.slug}
            href={`/essays/${essay.slug}`}
            className="flex gap-10 py-10 border-t border-border"
          >
            {/* Essay thumbnail */}
            <div className="hidden md:block w-[280px] h-[200px] shrink-0 border border-border relative overflow-hidden">
              <Image src={essay.thumbnail ?? PLACEHOLDER.essay} alt="" fill className="object-cover" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-center gap-3">
              <span className="font-mono text-[9px] font-medium uppercase tracking-[3px] text-accent-dim">
                {(essay.category ?? "ESSAY").toUpperCase()} &middot; {essay.readTime ? `${essay.readTime} ${t("minRead")}` : ""}
              </span>
              <h3 className="font-serif text-[28px] text-text-primary leading-[1.2] whitespace-pre-line">
                {essay.title}
              </h3>
              <p className="font-sans text-[13px] text-text-secondary leading-[1.6] max-w-[600px]">
                {essay.excerpt}
              </p>
              <span className="font-sans text-[11px] text-text-muted">
                {essay.publishedAt
                  ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(essay.publishedAt)
                  : ""}
                {essay.substackUrl ? `  \u00B7  ${t("alsoOnSubstack")}` : ""}
                {essay.mediumUrl ? `  \u00B7  ${t("alsoOnMedium")}` : ""}
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ── Newsletter Section ── */}
      <section className="border-t border-border py-12 px-5 md:px-10 xl:px-20 flex flex-col items-center gap-5">
        <p className="font-sans text-sm text-text-secondary">
          {t("newsletterDescription")}
        </p>

        <NewsletterForm source="essays" />

        <p className="font-mono text-[10px] tracking-[1px] text-text-muted">
          {t("newsletterFootnote")}
        </p>
      </section>
    </>
  );
}
