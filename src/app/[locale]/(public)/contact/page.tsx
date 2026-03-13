import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { label: "Substack", href: "https://mihaigavrilescu.substack.com" },
  { label: "Medium", href: "https://medium.com/@mihaigavrilescu" },
  { label: "Spotify", href: "https://open.spotify.com/artist/mihaigavrilescu" },
  { label: "GitHub", href: "https://github.com/mihaigavrilescu" },
  { label: "Instagram", href: "https://instagram.com/mihaigavrilescu" },
  { label: "Facebook", href: "https://facebook.com/mihaigavrilescu" },
  { label: "TikTok", href: "https://tiktok.com/@mihaigavrilescu" },
  { label: "YouTube", href: "https://youtube.com/@mihaigavrilescu" },
];

export default async function ContactPage() {
  const t = await getTranslations("contact");

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
            For collaborations, readings, speaking invitations,
            {"\n"}or research inquiries. Also accepting requests for card tricks
            {"\n"}at literary events (ask politely).
          </p>

          <a
            href="mailto:hello@mihaiGavrilescu.com"
            className="font-mono text-sm text-accent tracking-[1px] hover:text-accent-glow transition-colors"
          >
            hello@mihaiGavrilescu.com
          </a>

          <div className="flex flex-col gap-3">
            {socialLinks.map((platform) => (
              <a
                key={platform.label}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[13px] text-text-secondary hover:text-text-primary transition-colors"
              >
                {platform.label} &rarr;
              </a>
            ))}
          </div>
        </div>

        {/* ── Right Column: Form ── */}
        <div className="flex flex-1 flex-col gap-5">
          <Input
            id="name"
            label={t("formNameLabel")}
            type="text"
            placeholder={t("formNamePlaceholder")}
          />

          <Input
            id="email"
            label={t("formEmailLabel")}
            type="email"
            placeholder={t("formEmailPlaceholder")}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted"
            >
              {t("formMessageLabel")}
            </label>
            <textarea
              id="message"
              placeholder={t("formMessagePlaceholder")}
              className="w-full h-[120px] bg-transparent border border-border text-text-primary font-sans text-[13px] px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim resize-none"
            />
          </div>

          <div className="bg-accent px-8 py-3.5 w-fit">
            <span className="font-sans text-[13px] font-medium text-text-on-accent">
              {t("sendMessage")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
