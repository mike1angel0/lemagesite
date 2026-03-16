import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { LockBadge } from "@/components/ui/lock-badge";
import {
  getFeaturedContent,
  getUpcomingEvents,
  getPartners,
  getRandomQuote,
  getAboutContent,
  getSocialLinks,
  getSiteImages,
} from "@/lib/data";
import { PLACEHOLDER, BLUR_DATA_URL } from "@/lib/placeholders";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook",
  twitter: "X", bluesky: "Bluesky", threads: "Threads", mastodon: "Mastodon",
  medium: "Medium", substack: "Substack", spotify: "Spotify", soundcloud: "SoundCloud",
  bandcamp: "Bandcamp", appleMusic: "Apple Music", github: "GitHub", linkedin: "LinkedIn",
  pinterest: "Pinterest", tumblr: "Tumblr", patreon: "Patreon", kofi: "Ko-fi",
  discord: "Discord", telegram: "Telegram", whatsapp: "WhatsApp", vimeo: "Vimeo",
  twitch: "Twitch", behance: "Behance", dribbble: "Dribbble", flickr: "Flickr",
  goodreads: "Goodreads", website: "Website",
};
import { getSiteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const t = await getTranslations("home");
  const [featured, upcomingEvents, partners, quote, aboutContent, config, socialLinks, siteImages] = await Promise.all([
    getFeaturedContent(),
    getUpcomingEvents(),
    getPartners(),
    getRandomQuote(),
    getAboutContent(),
    getSiteConfig(),
    getSocialLinks(),
    getSiteImages(),
  ]);

  const nextEvent = upcomingEvents[0] ?? null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[900px] overflow-hidden">
        {/* Background */}
        <Image src={siteImages.hero} alt="" fill className="object-cover" priority />

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
                  {t("latestPoemLabel")}
                </span>
                <h3 className="font-serif text-4xl text-text-primary leading-[1.15]">
                  {featured.latestPoem?.title ?? "Coming soon"}
                </h3>
                <p className="font-serif text-base italic text-text-secondary leading-relaxed max-w-[450px]">
                  {featured.latestPoem?.excerpt ?? ""}
                </p>
              </div>
              {featured.latestPoem && (
                <Link
                  href={`/poetry/${featured.latestPoem.slug}`}
                  className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
                >
                  {t("readPoem")} &rarr;
                </Link>
              )}
            </div>

            {/* Recent Research card */}
            <div className="h-[200px] bg-bg-card border border-border rounded-sm p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  {t("latestResearchLabel")}
                </span>
                <h3 className="font-serif text-2xl text-text-primary leading-[1.2] max-w-[500px]">
                  {featured.latestResearch?.title ?? "Coming soon"}
                </h3>
                {featured.latestResearch?.accessTier !== "FREE" && <LockBadge />}
              </div>
              {featured.latestResearch && (
                <Link
                  href={`/research/${featured.latestResearch.slug}`}
                  className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
                >
                  {t("viewPaper")} &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Featured Photo card */}
            <div className="h-[340px] bg-bg-card border border-border rounded-sm overflow-hidden relative">
              <Image
                src={featured.latestPhoto?.imageUrl ?? PLACEHOLDER.photo}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/85 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-8 gap-2">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  {t("featuredPhotoLabel")}
                </span>
                <h3 className="font-serif text-[28px] text-text-primary">
                  {featured.latestPhoto?.title ?? "Coming soon"}
                </h3>
                {featured.latestPhoto?.series && (
                  <p className="font-sans text-xs text-text-secondary">
                    {t("fromSeries")}: {featured.latestPhoto.series.name}
                  </p>
                )}
              </div>
            </div>

            {/* Recent Essay card */}
            <div className="h-[200px] bg-bg-card border border-border rounded-sm p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[9px] text-accent-dim tracking-[3px] font-medium uppercase">
                  {t("latestEssayLabel")}
                </span>
                <h3 className="font-serif text-2xl text-text-primary leading-[1.2] max-w-[500px]">
                  {featured.latestEssay?.title ?? "Coming soon"}
                </h3>
                {featured.latestEssay && (
                  <p className="font-sans text-[11px] text-text-muted">
                    {featured.latestEssay.readTime ? `${featured.latestEssay.readTime} min read` : ""}
                    {featured.latestEssay.publishedAt
                      ? ` \u00B7 Published ${new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(featured.latestEssay.publishedAt)}`
                      : ""}
                  </p>
                )}
              </div>
              {featured.latestEssay && (
                <Link
                  href={`/essays/${featured.latestEssay.slug}`}
                  className="font-sans text-xs text-starlight tracking-[1px] inline-flex items-center gap-1"
                >
                  {t("readEssay")} &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote Interlude ── */}
      <section className="h-[360px] relative overflow-hidden">
        {/* Background image */}
        <Image src={PLACEHOLDER.generic} alt="" fill className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/50 to-bg/90" />

        <div className="relative flex h-full flex-col items-center justify-center gap-6 px-5 md:px-[200px] text-center">
          <blockquote className="font-serif text-xl md:text-2xl font-light text-warm-ivory leading-[1.8] max-w-[600px]">
            &ldquo;{quote?.text ?? "And in the end, we found that silence had its own geography."}&rdquo;
          </blockquote>
          <p className="font-mono text-[10px] tracking-[2px] text-accent-dim">
            &mdash; {quote?.attribution ?? "From Nocturnal Echoes"}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-40" />
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-dim opacity-40" />
          </div>
        </div>
      </section>

      {/* ── Upcoming Event Bar ── */}
      {nextEvent && (
        <section className="bg-bg-surface border-y border-border">
          <div className="flex items-center justify-between gap-10 py-8 px-5 md:px-10 xl:px-20">
            <div className="flex items-center gap-6">
              {/* Date block */}
              <div className="flex flex-col items-center shrink-0">
                <span className="font-mono text-[10px] text-accent-dim tracking-[2px]">
                  {new Date(nextEvent.date).toLocaleString("en", { month: "short" }).toUpperCase()}
                </span>
                <span className="font-serif text-3xl text-text-primary">
                  {new Date(nextEvent.date).getDate()}
                </span>
              </div>

              {/* Event info */}
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-xl text-text-primary">
                  {nextEvent.title}
                </h3>
                <p className="font-sans text-xs text-text-secondary">
                  {nextEvent.location}
                </p>
              </div>
            </div>

            {/* RSVP button */}
            {nextEvent.rsvpUrl ? (
              <a
                href={nextEvent.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-accent-dim px-6 py-2.5 font-sans text-[11px] text-starlight tracking-[2px] shrink-0"
              >
                RSVP &rarr;
              </a>
            ) : (
              <Link
                href={`/events/${nextEvent.slug}`}
                className="border border-accent-dim px-6 py-2.5 font-sans text-[11px] text-starlight tracking-[2px] shrink-0"
              >
                {t("eventDetails")} &rarr;
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── About Preview ── */}
      <section className="py-[100px] px-5 md:px-10 xl:px-20">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          {/* Portrait */}
          <div className="w-full md:w-[360px] h-[450px] rounded-sm border border-border shrink-0 relative overflow-hidden">
            <Image src={siteImages.portrait} alt="Portrait" fill className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
          </div>

          {/* Bio content */}
          <div className="flex-1 flex flex-col gap-6">
            <SectionLabel label={t("aboutLabel")} />

            <h2 className="font-serif text-3xl md:text-[42px] font-light text-warm-ivory leading-tight">
              {aboutContent.about_displayName || config.authorName}
            </h2>
            <p className="font-mono text-sm text-accent tracking-[1px]">
              {aboutContent.about_handle || config.authorHandle}
            </p>
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(socialLinks).slice(0, 5).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-text-muted hover:text-accent transition-colors tracking-[1px]"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                ))}
              </div>
            )}
            <p className="font-sans text-[15px] text-text-secondary leading-[1.8] max-w-[520px]">
              {aboutContent.about_bio?.split("\n\n")[0] || t("aboutBio1")}
            </p>
            <p className="font-sans text-[15px] text-text-secondary leading-[1.8] max-w-[520px]">
              {aboutContent.about_bio?.split("\n\n")[1] || t("aboutBio2")}
            </p>

            {/* Sparkle divider */}
            <div className="flex items-center gap-2">
              <span className="block w-1 h-1 rounded-full bg-accent-dim" />
              <span className="block w-1 h-1 rounded-full bg-accent-dim" />
              <span className="block w-1 h-1 rounded-full bg-accent-dim" />
            </div>

            <p className="font-serif text-xl md:text-[22px] italic text-starlight leading-[1.5]">
              &ldquo;{aboutContent.about_personalQuote || t("aboutQuote")}&rdquo;
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

          <NewsletterForm source="homepage" />

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
            {t("partnersDescription")}
          </p>

          <div className="flex flex-wrap justify-center gap-12">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex flex-col items-center gap-2"
              >
                {partner.url ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-text-muted tracking-[1px] hover:text-text-secondary transition-colors"
                  >
                    {partner.name}
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-text-muted tracking-[1px]">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>

          <Link href="/contact" className="font-sans text-xs text-starlight">
            {t("partnersContact")} &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
