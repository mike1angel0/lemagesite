import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { ContactForm } from "@/components/ui/contact-form";
import { getSocialLinks } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook",
  twitter: "X / Twitter", bluesky: "Bluesky", threads: "Threads", mastodon: "Mastodon",
  medium: "Medium", substack: "Substack", spotify: "Spotify", soundcloud: "SoundCloud",
  bandcamp: "Bandcamp", appleMusic: "Apple Music", github: "GitHub", linkedin: "LinkedIn",
  pinterest: "Pinterest", tumblr: "Tumblr", patreon: "Patreon", kofi: "Ko-fi",
  discord: "Discord", telegram: "Telegram", whatsapp: "WhatsApp", vimeo: "Vimeo",
  twitch: "Twitch", behance: "Behance", dribbble: "Dribbble", flickr: "Flickr",
  goodreads: "Goodreads", website: "Website",
};

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const [socialLinks, config] = await Promise.all([getSocialLinks(), getSiteConfig()]);

  return (
    <section className="px-5 md:px-10 xl:px-20 py-[100px]">
      <div className="flex flex-col md:flex-row gap-16 md:gap-[120px]">
        {/* ── Left Column ── */}
        <div className="flex flex-1 flex-col gap-8">
          <SectionLabel label="CONTACT" />

          <h1 className="font-serif text-4xl md:text-[48px] font-light text-text-primary leading-tight">
            {t("heroTitle")}
          </h1>

          <p className="font-sans text-sm text-text-secondary leading-[1.6] max-w-[400px]">
            {t("heroDescription")}
          </p>

          <a
            href={`mailto:${config.contactEmail}`}
            className="font-mono text-sm text-accent tracking-[1px] hover:text-accent-glow transition-colors"
          >
            {config.contactEmail}
          </a>

          <div className="flex flex-col gap-3">
            {Object.entries(socialLinks).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[13px] text-text-secondary hover:text-text-primary transition-colors"
              >
                {SOCIAL_LABELS[key] ?? key} &rarr;
              </a>
            ))}
          </div>
        </div>

        {/* ── Right Column: Form ── */}
        <ContactForm />
      </div>
    </section>
  );
}
