import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const essays = [
  {
    title: "On the Architecture of Longing:\nWhy Machines Will Never Grieve",
    category: "AI & PHILOSOPHY",
    readTime: "12 MIN READ",
    excerpt:
      "There is a kind of knowing that requires breaking. The machine knows everything about the shape of loss without ever having lost anything...",
    slug: "/essays/on-the-architecture-of-longing",
    date: "February 2026",
    meta: "February 2026  \u00B7  Also on Medium",
    hasImage: true,
  },
  {
    title: "The Silence Between Languages:\nWriting in Two Tongues",
    category: "POETRY & LANGUAGE",
    readTime: "8 MIN READ",
    excerpt:
      "Romanian holds my childhood. English holds my thinking. The poem lives in the gap between them, in the untranslatable residue...",
    slug: "/essays/the-silence-between-languages",
    date: "January 2026",
    meta: "January 2026  \u00B7  Also on Substack",
    hasImage: true,
  },
  {
    title: "Seeing Without Looking: Notes on\nPhotography as Meditation",
    category: "PHOTOGRAPHY",
    readTime: "6 MIN READ",
    excerpt:
      "The camera is an instrument of attention. Not of capture. What you see depends entirely on what you are willing to wait for...",
    slug: "/essays/seeing-without-looking",
    date: "December 2025",
    meta: "December 2025",
    hasImage: false,
  },
  {
    title: "Seeing Without Looking: Notes on\nPhotography as Meditation",
    category: "PHOTOGRAPHY",
    readTime: "6 MIN READ",
    excerpt:
      "The camera is an instrument of attention. Not of capture. What you see depends entirely on what you are willing to wait for...",
    slug: "/essays/seeing-without-looking-2",
    date: "December 2025",
    meta: "December 2025",
    hasImage: true,
  },
];

export default async function EssaysPage() {
  const t = await getTranslations("essays");

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-10 gap-6">
        <SectionLabel label={t("sectionLabel")} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary whitespace-pre-line text-center leading-[1.15] max-w-[600px]">
          {t("heroTitle")}
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          Long-form essays, reflections, and field notes on AI, language, art,
          and the spaces in between — dispatches from asteroid B612.
        </p>
      </section>

      {/* ── Essays List ── */}
      <section className="px-5 md:px-10 xl:px-20">
        {essays.map((essay) => (
          <Link
            key={essay.slug}
            href={essay.slug}
            className="flex gap-10 py-10 border-t border-border"
          >
            {/* Essay thumbnail */}
            <div className="hidden md:block w-[280px] h-[200px] shrink-0 border border-border relative overflow-hidden">
              <Image src="/design-exports/lzEPd.png" alt="" fill className="object-cover" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-center gap-3">
              <span className="font-mono text-[9px] font-medium uppercase tracking-[3px] text-accent-dim">
                {essay.category} &middot; {essay.readTime}
              </span>
              <h3 className="font-serif text-[28px] text-text-primary leading-[1.2] whitespace-pre-line">
                {essay.title}
              </h3>
              <p className="font-sans text-[13px] text-text-secondary leading-[1.6] max-w-[600px]">
                {essay.excerpt}
              </p>
              <span className="font-sans text-[11px] text-text-muted">
                {essay.meta}
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ── Newsletter Section ── */}
      <section className="border-t border-border py-12 px-5 md:px-10 xl:px-20 flex flex-col items-center gap-5">
        <p className="font-sans text-sm text-text-secondary">
          Subscribe to receive new essays directly.
        </p>

        <form className="flex gap-0">
          <Input
            type="email"
            placeholder="your@email.com"
            className="w-[280px]"
          />
          <Button variant="filled" size="md">
            {t("newsletterSubscribe")}
          </Button>
        </form>

        <p className="font-mono text-[10px] tracking-[1px] text-text-muted">
          {t("newsletterFootnote")}
        </p>
      </section>
    </>
  );
}
