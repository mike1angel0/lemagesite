import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { QuoteInterlude } from "@/components/content/quote-interlude";

type TierDef = {
  labelKey: string;
  labelColor: string;
  nameKey: string;
  price: string;
  period: string;
  descKey: string;
  featureKeys: string[];
  ctaKey: string;
  ctaStyle: "ghost" | "filled" | "accent-ghost";
  highlighted: boolean;
  badgeKey: string | null;
  borderColor: string;
  bgColor: string;
};

const tierDefs: TierDef[] = [
  {
    labelKey: "FREE",
    labelColor: "text-text-muted",
    nameKey: "free",
    price: "Free",
    period: "",
    descKey: "The public observatory.",
    featureKeys: [
      "\u2713  Selected poems",
      "\u2713  Research abstracts",
      "\u2713  Newsletter",
    ],
    ctaKey: "BROWSE FREE",
    ctaStyle: "ghost",
    highlighted: false,
    badgeKey: null,
    borderColor: "border-border",
    bgColor: "",
  },
  {
    labelKey: "SUPPORTER",
    labelColor: "text-accent-dim",
    nameKey: "supporter",
    price: "\u20AC5",
    period: "/month",
    descKey: "The deeper view.",
    featureKeys: [
      "\u2713  Full poems",
      "\u2713  Full essays",
      "\u2713  Selected photography series",
    ],
    ctaKey: "BECOME SUPPORTER",
    ctaStyle: "filled",
    highlighted: false,
    badgeKey: null,
    borderColor: "border-accent-dim",
    bgColor: "",
  },
  {
    labelKey: "PATRON",
    labelColor: "text-accent",
    nameKey: "patron",
    price: "\u20AC15",
    period: "/month",
    descKey: "Full observatory access.",
    featureKeys: [
      "\u2713  Everything in Supporter",
      "\u2713  Full research papers",
      "\u2713  Deep dives & behind-the-scenes",
      "\u2713  Early access to new work",
    ],
    ctaKey: "BECOME PATRON",
    ctaStyle: "filled",
    highlighted: true,
    badgeKey: "RECOMMENDED",
    borderColor: "border-accent",
    bgColor: "bg-bg-card",
  },
  {
    labelKey: "INNER CIRCLE",
    labelColor: "text-accent-dim",
    nameKey: "innerCircle",
    price: "\u20AC50",
    period: "/month",
    descKey: "The private quarters.",
    featureKeys: [
      "\u2713  Everything in Patron",
      "\u2713  Drafts & private reflections",
      "\u2713  Quarterly private session",
      "\u2713  Early book access",
    ],
    ctaKey: "JOIN INNER CIRCLE",
    ctaStyle: "accent-ghost",
    highlighted: false,
    badgeKey: null,
    borderColor: "border-border",
    bgColor: "",
  },
];

export default async function MembershipPage() {
  const t = await getTranslations("membership");

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-[60px] gap-6">
        <SectionLabel label={t("sectionLabel")} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary text-center leading-[1.15] max-w-[600px] whitespace-pre-line">
          Choose how deep{"\n"}you want to look.
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[560px] whitespace-pre-line">
          From published work to private drafts. From abstracts to full research.
          {"\n"}Every tier unlocks a deeper layer of the observatory.
          {"\n\n"}&ldquo;One sees clearly only with the heart.&rdquo;
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
                  {tier.badgeKey}
                </span>
              )}

              {/* Tier Label */}
              <span className={`font-mono text-[10px] font-medium uppercase tracking-[3px] ${tier.labelColor}`}>
                {tier.labelKey}
              </span>

              {/* Price */}
              {tier.price === "Free" ? (
                <span className="font-serif text-[36px] font-light text-text-primary">
                  Free
                </span>
              ) : (
                <div className="flex items-end gap-1">
                  <span className="font-serif text-[36px] font-light text-text-primary">
                    {tier.price}
                  </span>
                  <span className="font-sans text-xs text-text-muted pb-1">
                    {tier.period}
                  </span>
                </div>
              )}

              {/* Description */}
              <span className="font-sans text-[13px] text-text-secondary">
                {tier.descKey}
              </span>

              {/* Divider */}
              <div className="h-px w-full bg-border" />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {tier.featureKeys.map((feature) => (
                  <li
                    key={feature}
                    className="font-sans text-xs text-text-secondary"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div
                className={`w-full flex justify-center py-3 font-sans text-[11px] font-medium tracking-[2px] uppercase ${
                  tier.ctaStyle === "filled"
                    ? "bg-accent text-text-on-accent"
                    : tier.ctaStyle === "accent-ghost"
                    ? "border border-accent-dim text-accent"
                    : "border border-border text-text-secondary"
                }`}
              >
                {tier.ctaKey}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quote Interlude ── */}
      <QuoteInterlude
        quote={`We measured the weight of pauses\nin conversations that ended before they began \u2014\nthe cartography of everything left unsaid.`}
        attribution={`From Cartography of Silence`}
        imageUrl="/images/membership-quote-bg.jpg"
      />

      {/* ── One-time Donation ── */}
      <section className="border-t border-border px-5 md:px-10 xl:px-20 py-[60px] flex flex-col items-center gap-5">
        <h2 className="font-serif text-2xl font-light text-text-primary text-center">
          Or make a one-time donation
        </h2>
        <p className="font-sans text-[13px] text-text-secondary text-center leading-[1.6] max-w-[400px]">
          Support the observatory with a single contribution.
          {"\n"}Even the smallest star illuminates something.
        </p>
        <div className="border border-accent-dim px-7 py-3">
          <span className="font-sans text-[11px] font-medium tracking-[2px] uppercase text-accent">
            DONATE &rarr;
          </span>
        </div>
      </section>
    </>
  );
}
