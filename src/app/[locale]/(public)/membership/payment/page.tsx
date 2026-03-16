"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Heart } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { useTranslations } from "next-intl";
import { createCheckoutSessionAction } from "@/lib/actions/stripe";

type TierConfig = {
  titleKey: string;
  descriptionKey: string;
  monthlyPrice: number;
  yearlyPrice: number;
  inclusions: string[];
  isDonation?: boolean;
};

const tierConfigs: Record<string, TierConfig> = {
  supporter: {
    titleKey: "supporterTier",
    descriptionKey: "supporterDescription",
    monthlyPrice: 4,
    yearlyPrice: 3,
    inclusions: [
      "Full poems and essays",
      "Selected photography series",
      "Community access",
    ],
  },
  patron: {
    titleKey: "patronTier",
    descriptionKey: "patronDescription",
    monthlyPrice: 10,
    yearlyPrice: 8,
    inclusions: [
      "All gated poetry, essays & research",
      "Full music discography & audio readings",
      "Early access to new releases",
      "10% discount at The Scriptorium",
    ],
  },
  "inner-circle": {
    titleKey: "innerCircleTier",
    descriptionKey: "innerCircleDescription",
    monthlyPrice: 200,
    yearlyPrice: 160,
    inclusions: [
      "Everything in Patron",
      "Work-in-progress drafts & private reflections",
      "Quarterly private 1:1 session",
      "Early book access & name in credits",
    ],
  },
  donation: {
    titleKey: "donationTitle",
    descriptionKey: "donationDescription",
    monthlyPrice: 0,
    yearlyPrice: 0,
    inclusions: [],
    isDonation: true,
  },
};

export default function MembershipPaymentPage() {
  const t = useTranslations("membership");
  const searchParams = useSearchParams();
  const tierParam = searchParams.get("tier") || "patron";
  const config = tierConfigs[tierParam] || tierConfigs.patron;

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const price = billingCycle === "monthly" ? config.monthlyPrice : config.yearlyPrice;

  if (config.isDonation) {
    return <DonationSection t={t} />;
  }

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      <div className="flex flex-col md:flex-row gap-16">
        {/* -- Left: Plan Details -- */}
        <div className="flex-1 flex flex-col gap-6">
          <SectionLabel label={t("sectionLabel")} />

          <h1 className="font-serif text-3xl md:text-[38px] font-light text-warm-ivory leading-tight">
            {t(config.titleKey)}
          </h1>

          <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-md">
            {t(config.descriptionKey)}
          </p>

          {/* What's included */}
          <span className="font-mono text-[10px] font-medium text-text-muted tracking-[3px] uppercase mt-4">
            {t("whatsIncluded")}
          </span>

          <div className="flex flex-col gap-3">
            {config.inclusions.map((item) => (
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
              {t(config.titleKey)} — {t(billingCycle === "monthly" ? "monthly" : "yearlySave")}
            </span>
            <span className="font-mono text-base text-starlight">
              &euro;{price} / {t("month")}
            </span>
          </div>

          {/* Billing toggle */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`flex-1 h-9 font-sans text-xs font-medium rounded flex items-center justify-center transition-colors ${
                billingCycle === "monthly"
                  ? "bg-accent text-text-on-accent"
                  : "border border-border text-text-secondary hover:border-accent-dim"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex-1 h-9 font-sans text-xs rounded flex items-center justify-center transition-colors ${
                billingCycle === "yearly"
                  ? "bg-accent text-text-on-accent font-medium"
                  : "border border-border text-text-secondary hover:border-accent-dim"
              }`}
            >
              {t("yearlySave")}
            </button>
          </div>

          {/* Checkout form */}
          <form action={createCheckoutSessionAction} className="flex flex-col gap-5 mt-6">
            <input type="hidden" name="tier" value={tierParam} />
            <input type="hidden" name="billingCycle" value={billingCycle} />

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

const DONATION_AMOUNTS = [5, 10, 25, 50];

function DonationSection({ t }: { t: (key: string) => string }) {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAmount = customAmount ? parseFloat(customAmount) : amount;

  async function handleDonate() {
    if (!selectedAmount || selectedAmount < 1) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: "donation",
              title: `Donation — €${selectedAmount}`,
              price: selectedAmount,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
        <SectionLabel label={t("sectionLabel")} />
        <h1 className="font-serif text-3xl md:text-[38px] font-light text-warm-ivory leading-tight text-center">
          {t("donationTitle")}
        </h1>
        <p className="font-sans text-sm text-text-secondary leading-relaxed text-center">
          {t("donationDescription")}
        </p>

        {/* Amount selector */}
        <div className="flex gap-3">
          {DONATION_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => { setAmount(a); setCustomAmount(""); }}
              className={`px-5 py-2.5 rounded-md font-mono text-sm transition-colors ${
                amount === a && !customAmount
                  ? "bg-accent text-bg"
                  : "border border-border text-text-secondary hover:border-accent-dim"
              }`}
            >
              &euro;{a}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-text-muted">&euro;</span>
          <input
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={t("customAmount") || "Custom amount"}
            className="w-32 bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim text-center"
          />
        </div>

        {/* Donate button */}
        <button
          onClick={handleDonate}
          disabled={loading || !selectedAmount || selectedAmount < 1}
          className="inline-flex items-center gap-2 bg-gold text-bg font-sans text-sm font-medium rounded-md px-8 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Heart size={14} />
          {loading ? t("processing") || "Processing..." : `${t("donateCta") || "Donate"} €${selectedAmount || 0}`}
        </button>

        <p className="font-mono text-[10px] text-text-muted text-center tracking-[1px]">
          {t("securedNote")}
        </p>
      </div>
    </section>
  );
}
