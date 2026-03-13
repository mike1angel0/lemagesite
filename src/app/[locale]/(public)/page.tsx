import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockBadge } from "@/components/ui/lock-badge";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[900px] overflow-hidden">
        {/* Background placeholder */}
        <div className="absolute inset-0 bg-bg-surface" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-bg/15 via-30% to-bg/60 to-65%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-[120px] px-5 md:px-20 gap-6">
          <SectionLabel label={t("heroLabel")} className="justify-center" />

          <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-warm-ivory leading-[1.3] max-w-[750px] whitespace-pre-line">
            {t("heroTitle")}
          </h1>

          {/* Decorative divider */}
          <div className="flex items-center gap-3">
            <span className="block w-16 h-px bg-accent-dim opacity-60" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-60" />
            <span className="block w-16 h-px bg-accent-dim opacity-60" />
          </div>

          <p className="font-mono text-[11px] text-accent-dim tracking-[3px]">
            {t("heroSubtitle")}
          </p>

          <div className="flex gap-6">
            <Button variant="filled" size="lg" asChild>
              <Link href="/poetry">{t("beginReading")}</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/about">{t("aboutPoetMage")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Featured Section ── */}
      <section className="py-20 px-5 md:px-10 xl:px-20">
        <SectionLabel label={t("latestSection")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Latest Poem card */}
            <div className="h-[340px] bg-bg-card border border-border rounded-sm p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  LATEST POEM
                </span>
                <h3 className="font-serif text-4xl text-text-primary leading-[1.15]">
                  The Cartographers{"\n"}of Silence
                </h3>
                <p className="font-serif text-base italic text-text-secondary leading-relaxed max-w-[450px]">
                  We are the cartographers of silence,
                  mapping the space between heartbeats,
                  tracing constellations on the dust...
                </p>
              </div>
              <Link
                href="/poetry/the-cartographers-of-silence"
                className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
              >
                {t("readPoem")} &rarr;
              </Link>
            </div>

            {/* Recent Research card */}
            <div className="h-[200px] bg-bg-card border border-border rounded-sm p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  LATEST RESEARCH
                </span>
                <h3 className="font-serif text-2xl text-text-primary leading-[1.2] max-w-[500px]">
                  Neural Architectures and the Poetics of Attention
                </h3>
                <LockBadge />
              </div>
              <Link
                href="/research/neural-architectures-poetics-attention"
                className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
              >
                {t("viewPaper")} &rarr;
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Featured Photo card */}
            <div className="h-[340px] bg-bg-card border border-border rounded-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-bg-surface" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/85 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-8 gap-2">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  FEATURED PHOTOGRAPH
                </span>
                <h3 className="font-serif text-[28px] text-text-primary">
                  Still Life with Fog
                </h3>
                <p className="font-sans text-xs text-text-secondary">
                  From the series: Silence Between Things
                </p>
              </div>
            </div>

            {/* Recent Essay card */}
            <div className="h-[200px] bg-bg-card border border-border rounded-sm p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  LATEST ESSAY
                </span>
                <h3 className="font-serif text-2xl text-text-primary leading-[1.2] max-w-[500px]">
                  On the Architecture of Longing:{"\n"}Why Machines Will Never Grieve
                </h3>
                <p className="font-sans text-[11px] text-text-muted">
                  12 min read &middot; Published February 2026
                </p>
              </div>
              <Link
                href="/essays/on-the-architecture-of-longing"
                className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
              >
                {t("readEssay")} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote Interlude ── */}
      <section className="h-[360px] relative overflow-hidden">
        {/* Background image placeholder */}
        <div className="absolute inset-0 bg-bg-surface" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/50 to-bg/90" />

        <div className="relative flex h-full flex-col items-center justify-center gap-6 px-5 md:px-[200px] text-center">
          <blockquote className="font-serif text-xl md:text-2xl font-light text-warm-ivory leading-[1.8] max-w-[600px]">
            &ldquo;And in the end, we found that silence
            had its own geography &mdash; vast, uncharted, beautiful,
            like the dark side of a familiar moon.&rdquo;
          </blockquote>
          <p className="font-mono text-[10px] tracking-[2px] text-accent-dim">
            &mdash; From Nocturnal Echoes
          </p>
          <div className="flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-40" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-40" />
          </div>
        </div>
      </section>

      {/* ── Upcoming Event Bar ── */}
      <section className="bg-bg-surface border-y border-border">
        <div className="flex items-center justify-between gap-10 py-8 px-5 md:px-10 xl:px-20">
          <div className="flex items-center gap-6">
            {/* Date block */}
            <div className="flex flex-col items-center shrink-0">
              <span className="font-mono text-[10px] text-accent-dim tracking-[2px]">
                MAR
              </span>
              <span className="font-serif text-3xl text-text-primary">15</span>
            </div>

            {/* Event info */}
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-xl text-text-primary">
                Poetry &amp; AI: A Live Reading + Conversation
              </h3>
              <p className="font-sans text-xs text-text-secondary">
                National Library, Bucharest &middot; 19:00 EET
              </p>
            </div>
          </div>

          {/* RSVP button */}
          <span className="border border-accent-dim px-6 py-2.5 font-sans text-[11px] text-starlight tracking-[2px] shrink-0">
            RSVP &rarr;
          </span>
        </div>
      </section>

      {/* ── About Preview ── */}
      <section className="py-[100px] px-5 md:px-10 xl:px-20">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          {/* Portrait placeholder */}
          <div className="w-full md:w-[360px] h-[450px] bg-bg-surface rounded-sm border border-border shrink-0" />

          {/* Bio content */}
          <div className="flex-1 flex flex-col gap-6">
            <SectionLabel label="THE POET-MAGE" />

            <h2 className="font-serif text-3xl md:text-[42px] font-light text-warm-ivory leading-tight">
              Mihai Gavrilescu
            </h2>
            <p className="font-sans text-[15px] text-text-secondary leading-[1.8] max-w-[520px]">
              Poet, photographer, singer-songwriter, and researcher. Once a magician by trade, now a conjurer of words. I live between languages &mdash; Romanian and English &mdash; and between worlds: the precision of neural architectures and the silence of verse.
            </p>
            <p className="font-sans text-[15px] text-text-secondary leading-[1.8] max-w-[520px]">
              This observatory is where those worlds meet. Come, look through the telescope.
            </p>

            {/* Sparkle divider */}
            <div className="flex items-center gap-2">
              <span className="block w-1 h-1 rounded-full bg-accent-dim" />
              <span className="block w-1 h-1 rounded-full bg-accent-dim" />
              <span className="block w-1 h-1 rounded-full bg-accent-dim" />
            </div>

            <p className="font-serif text-xl md:text-[22px] italic text-starlight leading-[1.5]">
              &ldquo;Every poem is a small act of magic &mdash;
              making the invisible appear.&rdquo;
            </p>
            <Link
              href="/about"
              className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
            >
              {t("fullBiography")} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter Section ── */}
      <section className="bg-bg-surface border-t border-border py-20 px-5 md:px-10 xl:px-20">
        <div className="flex flex-col items-center gap-10 text-center">
          <SectionLabel
            label={t("newsletterLabel")}
            className="justify-center"
          />

          <h2 className="font-serif text-3xl md:text-[38px] font-light text-warm-ivory leading-[1.3] max-w-[600px]">
            {t("newsletterHeadline")}
          </h2>
          <p className="font-sans text-sm text-text-secondary max-w-[500px] leading-relaxed">
            {t("newsletterDescription")}
          </p>

          <form className="flex items-center gap-0">
            <Input
              type="email"
              placeholder="your@email.com"
              className="w-[320px]"
            />
            <Button variant="filled" size="md">
              {t("newsletterSubscribe")}
            </Button>
          </form>

          <p className="font-mono text-[10px] text-text-muted tracking-[1px]">
            {t("newsletterFootnote")}
          </p>
        </div>
      </section>

      {/* ── Partners Section ── */}
      <section className="border-t border-border py-16 px-5 md:px-10 xl:px-20">
        <div className="flex flex-col items-center gap-10">
          <SectionLabel label={t("partnersLabel")} className="justify-center" />

          <p className="font-sans text-sm text-text-secondary text-center max-w-[520px] leading-relaxed">
            The Observatory is sustained through creative partnerships
            with publishers, galleries, and cultural institutions we believe in.
          </p>

          <div className="flex flex-wrap justify-center gap-12">
            {["NEMIRA", "CARTURESTI", "MNAC", "DILEMA", "SUBSTACK"].map(
              (partner) => (
                <div
                  key={partner}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="font-mono text-[11px] text-text-muted tracking-[1px]">
                    {partner}
                  </span>
                </div>
              ),
            )}
          </div>

          <p className="font-sans text-xs text-starlight">
            Interested in partnering?  Contact us &rarr;
          </p>
        </div>
      </section>
    </>
  );
}
