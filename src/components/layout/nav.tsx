"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Link as IntlLink } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavMobile } from "./nav-mobile";

const navLinks = [
  { href: "/poetry", labelKey: "poetry" },
  { href: "/photography", labelKey: "photography" },
  { href: "/music", labelKey: "music" },
  { href: "/research", labelKey: "research" },
  { href: "/essays", labelKey: "essays" },
  { href: "/books", labelKey: "books" },
  { href: "/shop", labelKey: "shop" },
  { href: "/membership", labelKey: "membership" },
] as const;

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const localePath = locale === "ro" ? "" : `/${locale}`;

  const pathnameWithoutLocale = pathname.replace(/^\/(en|ro)/, "") || "/";
  const targetLocale = locale === "ro" ? "en" : "ro";

  return (
    <>
      <header className="w-full bg-[#101828]">
        <nav className="flex items-center justify-between px-5 md:px-10 xl:px-20">
          {/* Left: Logo */}
          <Link href={`${localePath}/`} className="shrink-0">
            <Image
              src="/logo.png"
              alt="The Observatory"
              width={160}
              height={76}
              className="h-[100px] w-auto"
              priority
            />
          </Link>

          {/* Center: Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.labelKey}
                href={`${localePath}${link.href}`}
                className={cn(
                  "font-sans text-xs tracking-[1px] uppercase transition-colors",
                  pathname === `${localePath}${link.href}`
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Right: Language toggle + CTA (desktop) */}
          <div className="hidden md:flex items-center gap-5">
            <IntlLink
              href={pathnameWithoutLocale}
              locale={targetLocale}
              className="font-mono text-[10px] text-text-muted hover:text-text-secondary transition-colors tracking-wider"
            >
              {t("langToggle")}
            </IntlLink>
            <Link
              href={`${localePath}/membership`}
              className="font-sans text-[10px] font-medium text-starlight tracking-[2px] uppercase border border-accent-dim px-5 py-2 hover:border-accent hover:text-accent-glow transition-colors"
            >
              {t("enterObservatory")}
            </Link>
          </div>

          {/* Mobile: Hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <NavMobile
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        locale={locale}
      />
    </>
  );
}
