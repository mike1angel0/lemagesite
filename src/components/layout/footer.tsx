"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const exploreLinks = [
  { href: "/poetry", labelKey: "poetry" },
  { href: "/photography", labelKey: "photography" },
  { href: "/music", labelKey: "music" },
  { href: "/books", labelKey: "books" },
] as const;

const knowledgeLinks = [
  { href: "/research", labelKey: "research" },
  { href: "/essays", labelKey: "essays" },
  { href: "/events", labelKey: "events" },
  { href: "/about", labelKey: "about" },
] as const;

const connectLinks = [
  { href: "/membership", labelKey: "membership" },
  { href: "/newsletter", labelKey: "newsletter" },
  { href: "/contact", labelKey: "contact" },
] as const;

const socialPlatforms = [
  { label: "Instagram", href: "https://instagram.com/mihaigavrilescu" },
  { label: "YouTube", href: "https://youtube.com/@mihaigavrilescu" },
  { label: "TikTok", href: "https://tiktok.com/@mihaigavrilescu" },
] as const;

const socialLinksBottom = [
  { label: "Substack", href: "https://mihaigavrilescu.substack.com" },
  { label: "Medium", href: "https://medium.com/@mihaigavrilescu" },
  { label: "Spotify", href: "https://open.spotify.com/artist/mihaigavrilescu" },
  { label: "GitHub", href: "https://github.com/mihaigavrilescu" },
  { label: "Instagram", href: "https://instagram.com/mihaigavrilescu" },
  { label: "Facebook", href: "https://facebook.com/mihaigavrilescu" },
  { label: "TikTok", href: "https://tiktok.com/@mihaigavrilescu" },
  { label: "YouTube", href: "https://youtube.com/@mihaigavrilescu" },
] as const;

interface FooterColumnProps {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col">
      <h4 className="font-sans text-[10px] font-medium text-text-muted tracking-[3px] uppercase mb-4">
        {title}
      </h4>
      <div className="flex flex-col gap-4">
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="font-sans text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const localePath = locale === "ro" ? "" : `/${locale}`;
  const currentYear = new Date().getFullYear();

  const resolvedExplore = exploreLinks.map((l) => ({
    href: `${localePath}${l.href}`,
    label: t(`exploreLinks.${l.labelKey}`),
  }));

  const resolvedKnowledge = knowledgeLinks.map((l) => ({
    href: `${localePath}${l.href}`,
    label: t(`knowledgeLinks.${l.labelKey}`),
  }));

  const resolvedConnect = [
    ...connectLinks.map((l) => ({
      href: `${localePath}${l.href}`,
      label: t(`connectLinks.${l.labelKey}`),
    })),
    ...socialPlatforms.map((s) => ({
      href: s.href,
      label: s.label,
    })),
  ];

  return (
    <footer className="w-full bg-[#101828] border-t border-[#243050]">
      <div className="py-16 px-5 md:px-10 xl:px-20">
        {/* Top section */}
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand column */}
          <div className="max-w-xs">
            <Link href={`${localePath}/`}>
              <Image
                src="/logo.png"
                alt="Selenarium"
                width={160}
                height={76}
                className="h-[100px] w-auto"
              />
            </Link>
            <p className="mt-4 font-sans text-xs text-text-muted leading-relaxed">
              {t("tagline")}
            </p>
            <Link href={`${localePath}/membership/payment`} className="mt-6 inline-flex items-center gap-2 font-sans text-[11px] font-medium text-text-secondary tracking-[2px] uppercase border border-accent-dim px-4 py-2 rounded hover:border-accent hover:text-text-primary transition-colors">
              <Heart size={14} />
              {t("supportWork")}
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <FooterColumn title={t("explore")} links={resolvedExplore} />
            <FooterColumn title={t("knowledge")} links={resolvedKnowledge} />
            <FooterColumn title={t("connect")} links={resolvedConnect} />
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-5 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="font-mono text-[10px] text-text-muted">
            {t("copyright", { year: currentYear })}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {socialLinksBottom.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[11px] text-text-muted hover:text-text-secondary transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
