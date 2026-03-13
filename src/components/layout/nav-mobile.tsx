"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface NavMobileProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function NavMobile({ isOpen, onClose, locale }: NavMobileProps) {
  const t = useTranslations("nav");

  const localePath = locale === "ro" ? "" : `/${locale}`;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-bg/95 backdrop-blur transition-opacity duration-300",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "flex flex-col h-full px-5 py-5 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col items-center justify-center flex-1 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.labelKey}
              href={`${localePath}${link.href}`}
              onClick={onClose}
              className="font-serif text-2xl text-text-primary py-3 hover:text-warm-ivory transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}

          {/* Language toggle */}
          <div className="mt-8 mb-4">
            <Link
              href={locale === "ro" ? `/en` : `/`}
              onClick={onClose}
              className="font-mono text-xs text-text-muted hover:text-text-secondary transition-colors tracking-wider"
            >
              {t("langToggle")}
            </Link>
          </div>

          {/* CTA */}
          <Link
            href={`${localePath}/membership`}
            onClick={onClose}
            className="font-sans text-[10px] font-medium text-starlight tracking-[2px] uppercase border border-accent-dim px-5 py-2 hover:border-accent hover:text-accent-glow transition-colors"
          >
            {t("enterObservatory")}
          </Link>
        </nav>
      </div>
    </div>
  );
}
