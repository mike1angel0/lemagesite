"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations("common");

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 border border-accent-dim/50 rounded-full px-5 py-2.5 font-sans text-xs text-accent hover:text-text-primary hover:border-accent transition-colors tracking-[1px] uppercase no-print"
    >
      <Printer className="size-3.5" />
      <span>{t("print")}</span>
    </button>
  );
}
