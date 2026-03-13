import { Check } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

const inclusions = [
  "All gated poetry, essays & research",
  "Full music discography & audio readings",
  "Early access to new releases",
  "10% discount at The Scriptorium",
];

export default async function MembershipPaymentPage() {
  const t = await getTranslations("membership");

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      <div className="flex flex-col md:flex-row gap-16">
        {/* -- Left: Plan Details -- */}
        <div className="flex-1 flex flex-col gap-6">
          <SectionLabel label={t("label").toUpperCase()} />

          <h1 className="font-serif text-3xl md:text-[38px] font-light text-warm-ivory leading-tight">
            {t("patronTier")}
          </h1>

          <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-md">
            {t("patronDescription")}
          </p>

          {/* What's included */}
          <span className="font-mono text-[10px] font-medium text-text-muted tracking-[3px] uppercase mt-4">
            {t("whatsIncluded")}
          </span>

          <div className="flex flex-col gap-3">
            {inclusions.map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <Check className="size-3.5 text-accent shrink-0" />
                <span className="font-sans text-[13px] text-text-secondary">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* -- Right: Payment Form -- */}
        <div className="w-full md:w-[420px] bg-bg-surface border border-border rounded-lg p-8 shrink-0">
          {/* Price row */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-sm font-medium text-text-primary">
              {t("patronMonthly")}
            </span>
            <span className="font-mono text-base text-starlight">
              &euro;9 / {t("month")}
            </span>
          </div>

          {/* Billing toggle */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              className="flex-1 h-9 bg-accent text-text-on-accent font-sans text-xs font-medium rounded flex items-center justify-center"
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              className="flex-1 h-9 border border-border text-text-secondary font-sans text-xs rounded flex items-center justify-center hover:border-accent-dim transition-colors"
            >
              {t("yearlySave")}
            </button>
          </div>

          {/* Form fields */}
          <form className="flex flex-col gap-5 mt-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-text-secondary">
                {t("emailField")}
              </label>
              <div className="flex items-center h-10 bg-bg-elevated border border-border rounded px-3">
                <span className="font-sans text-[13px] text-text-muted">
                  your@email.com
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-text-secondary">
                {t("cardField")}
              </label>
              <div className="flex items-center h-10 bg-bg-elevated border border-border rounded px-3">
                <span className="font-mono text-[13px] text-text-muted">
                  4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center h-11 bg-accent text-text-on-accent font-sans text-xs font-medium tracking-[2px] uppercase rounded hover:bg-accent-glow transition-colors"
            >
              {t("subscribeButton")}
            </button>
          </form>

          <p className="font-mono text-[10px] text-text-muted text-center mt-4 tracking-[1px]">
            {t("securedNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
