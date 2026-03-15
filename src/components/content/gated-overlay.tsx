"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GatedOverlayProps {
  contentType?: string;
  tier?: string;
  className?: string;
}

export function GatedOverlay({ contentType = "content", tier = "Patron", className }: GatedOverlayProps) {
  const t = useTranslations("gated");

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 py-12 px-5 md:px-[200px]",
        "bg-gradient-to-t from-bg via-bg/90 to-transparent",
        className,
      )}
    >
      <Lock className="size-8 text-accent-dim" />

      <h3 className="font-serif text-2xl md:text-[28px] font-light text-text-primary text-center">
        {t("title", { contentType, tier })}
      </h3>

      <p className="font-sans text-sm text-text-secondary leading-relaxed text-center max-w-[460px]">
        {t("description", { tier })}
      </p>

      <div className="flex items-center gap-4 mt-2">
        <Link
          href={`/membership/payment?tier=${tier.toLowerCase().replace(" ", "-")}`}
          className="inline-flex items-center justify-center font-sans text-sm font-medium bg-accent text-text-on-accent rounded px-8 py-3.5 hover:bg-accent-glow transition-colors"
        >
          {t("becomePatron", { tier })}
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center font-sans text-[13px] text-accent border border-accent-dim rounded px-8 py-3.5 hover:border-accent transition-colors"
        >
          {t("signInLink")}
        </Link>
      </div>
    </div>
  );
}
