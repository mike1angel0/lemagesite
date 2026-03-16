import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { getAboutContent, getSocialLinks, getSiteImages } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";
import { BLUR_DATA_URL } from "@/lib/placeholders";

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

const defaultCollaborators = [
  {
    name: "NEMIRA",
    tag: "Publisher",
    desc: "Publishing partner since 2022. Nemira has brought three poetry collections to print, with distribution across Romania and select European bookstores.",
    link: "Visit Nemira \u2192",
  },
  {
    name: "MNAC",
    tag: "Museum",
    desc: "Ongoing exhibition partnership with the National Museum of Contemporary Art. Two solo photography exhibitions and a permanent collection placement.",
    link: "Visit MNAC \u2192",
  },
  {
    name: "DILEMA VECHE",
    tag: "Magazine",
    desc: "Monthly poetry column since 2023. Selected poems are first published in Dilema Veche before appearing on the Selenarium.",
    link: "Read the column \u2192",
  },
  {
    name: "C\u0102RTURE\u015ETI",
    tag: "Bookstore",
    desc: "Exclusive retail partner for signed first editions. Book launches and reading events hosted at C\u0103rture\u0219ti Carusel, Bucharest.",
    link: "Visit store \u2192",
  },
];

export default async function AboutPage() {
  const t = await getTranslations("about");
  const [aboutContent, config, socialLinks, siteImages] = await Promise.all([getAboutContent(), getSiteConfig(), getSocialLinks(), getSiteImages()]);

  const collaborators = aboutContent.about_collaborators
    ? JSON.parse(aboutContent.about_collaborators)
    : defaultCollaborators;

  return (
    <>
      {/* ── Bio Hero ── */}
      <section className="flex flex-col md:flex-row gap-20 px-5 md:px-10 xl:px-20 py-20">
        {/* Portrait */}
        <div className="w-full md:w-[420px] h-[560px] border border-border shrink-0 relative overflow-hidden">
          <Image src={siteImages.portrait} alt="Portrait" fill className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
        </div>

        {/* Intro */}
        <div className="flex flex-1 flex-col gap-6">
          <SectionLabel label={t("astronomerLabel")} />

          <h1 className="font-serif text-4xl md:text-[52px] font-light text-text-primary leading-tight">
            {aboutContent.about_displayName || config.authorName}
          </h1>
          <p className="font-mono text-sm text-accent tracking-[1px]">
            {aboutContent.about_handle || config.authorHandle}
          </p>

          {Object.keys(socialLinks).length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(socialLinks).map(([key, url]) => (
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

          <p className="font-sans text-[13px] text-accent-dim tracking-[2px]">
            {aboutContent.about_roles || t("roleLabel")}
          </p>

          <div className="font-sans text-[15px] text-text-secondary leading-[1.8] max-w-[560px] space-y-4">
            {(aboutContent.about_bio || `${t("bio1")}\n\n${t("bio2")}`).split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <p className="font-serif text-2xl italic text-accent leading-[1.4]">
            &ldquo;{aboutContent.about_personalQuote || t("personalQuote")}&rdquo;
          </p>
        </div>
      </section>

      {/* ── Academic CV ── */}
      <section className="border-t border-border px-5 md:px-10 xl:px-20 py-[60px] flex flex-col gap-10">
        <SectionLabel label={t("academicCvLabel")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Left: Education + Publications */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              {t("educationLabel")}
            </span>
            <p className="font-sans text-[13px] text-text-secondary leading-[1.6] whitespace-pre-line">
              {aboutContent.about_education || "Ph.D. Candidate, Computational Linguistics — University of Bucharest, 2022–present\nM.Sc. Computer Science, AI — Politehnica University, 2020"}
            </p>

            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              {t("publicationsLabel")}
            </span>
            <p className="font-sans text-[13px] text-text-secondary leading-[1.6] whitespace-pre-line">
              {aboutContent.about_publications || "Neural Architectures and the Poetics of Attention (2025)\nOn Machine Grief: Can Artificial Systems Experience Loss? (2024)\nGenerative Verse: Fine-Tuning LLMs on Poetic Corpora (2024)"}
            </p>
          </div>

          {/* Right: Achievements + Downloads */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              {t("achievementsLabel")}
            </span>
            <p className="font-sans text-[13px] text-text-secondary leading-[1.6] whitespace-pre-line">
              {aboutContent.about_achievements || "Romanian National Poetry Prize, 2024\nBest Paper, ACL Workshop on Creativity & NLP, 2023\nPushcart Prize Nominee, 2022\nCarpathian Arts Residency Fellow, 2023"}
            </p>

            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              {t("downloadsLabel")}
            </span>
            <div className="border border-accent-dim px-5 py-2.5 w-fit">
              <span className="font-sans text-xs text-accent">
                Download Full CV (PDF) &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collaborators & Partners ── */}
      <section className="border-t border-border px-5 md:px-10 xl:px-20 py-[60px] flex flex-col gap-10">
        <SectionLabel label={t("collaboratorsLabel")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collaborators.map((collab: { name: string; tag: string; desc: string; link: string }) => (
            <div
              key={collab.name}
              className="bg-bg-card border border-border rounded-lg p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[2px] text-accent">
                  {collab.name}
                </span>
                <span className="font-mono text-[10px] text-text-muted bg-bg-elevated rounded px-2.5 py-1">
                  {collab.tag}
                </span>
              </div>
              <p className="font-sans text-[13px] text-text-secondary leading-[1.6]">
                {collab.desc}
              </p>
              <span className="font-sans text-xs font-medium text-gold">
                {collab.link}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Support the Selenarium ── */}
      <section className="border-t border-border bg-bg-card px-5 md:px-10 xl:px-20 py-[60px] flex flex-col items-center gap-5">
        <SectionLabel label={t("supportLabel")} className="justify-center" />

        <h2 className="font-serif text-[28px] font-light text-text-primary text-center">
          {aboutContent.about_supportHeading || t("supportTitle")}
        </h2>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          {aboutContent.about_supportDescription || t("supportDescription")}
        </p>

        <div className="flex gap-4">
          <Button variant="filled" size="lg" asChild>
            <Link href="/membership">{t("ctaBecomePatron")}</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/membership/payment">{t("ctaDonation")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
