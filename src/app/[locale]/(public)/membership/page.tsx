import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionLabel } from "@/components/ui/section-label";
import { QuoteInterlude } from "@/components/content/quote-interlude";
import { getPageContent } from "@/lib/data";

type TierDef = {
  labelKey: string;
  labelColor: string;
  nameKey: string;
  price: string;
  periodKey: string;
  descKey: string;
  featureKeys: string[];
  ctaKey: string;
  ctaHref: string;
  ctaStyle: "ghost" | "filled" | "accent-ghost";
  highlighted: boolean;
  badgeKey: string | null;
  borderColor: string;
  bgColor: string;
};

const tierDefs: TierDef[] = [
  {
    labelKey: "free",
    labelColor: "text-text-muted",
    nameKey: "free",
    price: "",
    periodKey: "",
    descKey: "freeDescription",
    featureKeys: ["featureSelectedPoems", "featureResearchAbstracts", "featureNewsletter"],
    ctaKey: "ctaGetStarted",
    ctaHref: "/poetry",
    ctaStyle: "ghost",
    highlighted: false,
    badgeKey: null,
    borderColor: "border-border",
    bgColor: "",
  },
  {
    labelKey: "supporter",
    labelColor: "text-accent-dim",
    nameKey: "supporter",
    price: "\u20AC4",
    periodKey: "perMonth",
    descKey: "supporterTagline",
    featureKeys: ["featureFullPoems", "featureFullEssays", "featureSelectedPhotography"],
    ctaKey: "ctaBecomeSupporter",
    ctaHref: "/membership/payment?tier=supporter",
    ctaStyle: "filled",
    highlighted: false,
    badgeKey: null,
    borderColor: "border-accent-dim",
    bgColor: "",
  },
  {
    labelKey: "patron",
    labelColor: "text-accent",
    nameKey: "patron",
    price: "\u20AC10",
    periodKey: "perMonth",
    descKey: "patronTagline",
    featureKeys: ["featureEverythingSupporter", "featureFullResearchPapers", "featureDeepDives", "featureEarlyAccess"],
    ctaKey: "ctaBecomePatron",
    ctaHref: "/membership/payment?tier=patron",
    ctaStyle: "filled",
    highlighted: true,
    badgeKey: "recommended",
    borderColor: "border-accent",
    bgColor: "bg-bg-card",
  },
  {
    labelKey: "innerCircle",
    labelColor: "text-accent-dim",
    nameKey: "innerCircle",
    price: "\u20AC200",
    periodKey: "perMonth",
    descKey: "innerCircleTagline",
    featureKeys: ["featureEverythingPatron", "featureWipDrafts", "featureQuarterlySession", "featureEarlyBookAccess"],
    ctaKey: "ctaJoinInnerCircle",
    ctaHref: "/membership/payment?tier=inner-circle",
    ctaStyle: "accent-ghost",
    highlighted: false,
    badgeKey: null,
    borderColor: "border-border",
    bgColor: "",
  },
];

export default async function MembershipPage() {
  const t = await getTranslations("membership");
  const locale = await getLocale();
  const content = await getPageContent("membership", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-[60px] gap-6">
        <SectionLabel label={content.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary text-center leading-[1.15] max-w-[600px] whitespace-pre-line">
          {content.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[560px] whitespace-pre-line">
          {content.heroDescription}
        </p>
      </section>

      {/* ── Pricing Grid ── */}
      <section className="px-5 md:px-10 xl:px-[60px]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {tierDefs.map((tier) => (
            <div
              key={tier.nameKey}
              className={`border p-8 flex flex-col gap-5 ${tier.borderColor} ${tier.bgColor}`}
            >
              {/* Badge */}
              {tier.badgeKey && (
                <span className="font-mono text-[9px] font-medium uppercase tracking-[3px] text-accent">
                  {t(tier.badgeKey)}
                </span>
              )}

              {/* Tier Label */}
              <span className={`font-mono text-[10px] font-medium uppercase tracking-[3px] ${tier.labelColor}`}>
                {t(tier.labelKey)}
              </span>

              {/* Price */}
              {!tier.price ? (
                <span className="font-serif text-[36px] font-light text-text-primary">
                  {t("free")}
                </span>
              ) : (
                <div className="flex items-end gap-1">
                  <span className="font-serif text-[36px] font-light text-text-primary">
                    {tier.price}
                  </span>
                  <span className="font-sans text-xs text-text-muted pb-1">
                    {t(tier.periodKey)}
                  </span>
                </div>
              )}

              {/* Description */}
              <span className="font-sans text-[13px] text-text-secondary">
                {t(tier.descKey)}
              </span>

              {/* Divider */}
              <div className="h-px w-full bg-border" />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {tier.featureKeys.map((featureKey) => (
                  <li
                    key={featureKey}
                    className="font-sans text-xs text-text-secondary"
                  >
                    ✓  {t(featureKey)}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.ctaHref}
                className={`w-full flex justify-center py-3 font-sans text-[11px] font-medium tracking-[2px] uppercase transition-opacity hover:opacity-80 ${
                  tier.ctaStyle === "filled"
                    ? "bg-accent text-text-on-accent"
                    : tier.ctaStyle === "accent-ghost"
                    ? "border border-accent-dim text-accent"
                    : "border border-border text-text-secondary"
                }`}
              >
                {t(tier.ctaKey)}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quote Interlude ── */}
      <QuoteInterlude
        quote={t("quoteText")}
        attribution={t("quoteAuthor")}
        imageUrl="/images/membership-quote-bg.jpg"
      />

      {/* ── One-time Donation ── */}
      <section className="border-t border-border px-5 md:px-10 xl:px-20 py-[60px] flex flex-col items-center gap-5">
        <h2 className="font-serif text-2xl font-light text-text-primary text-center">
          {t("donationTitle")}
        </h2>
        <p className="font-sans text-[13px] text-text-secondary text-center leading-[1.6] max-w-[400px]">
          {t("donationDescription")}
        </p>
        <Link
          href="/membership/payment?tier=donation"
          className="border border-accent-dim px-7 py-3 transition-opacity hover:opacity-80"
        >
          <span className="font-sans text-[11px] font-medium tracking-[2px] uppercase text-accent">
            {t("donationLabel")} &rarr;
          </span>
        </Link>
      </section>
    </>
  );
}
