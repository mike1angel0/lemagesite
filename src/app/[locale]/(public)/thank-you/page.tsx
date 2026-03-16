import Link from "next/link";
import { Heart } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; ref?: string }>;
}) {
  const t = await getTranslations("thankYou");
  const locale = await getLocale();
  const { amount, ref } = await searchParams;

  const displayAmount = amount ? `€${parseFloat(amount).toFixed(2)}` : "€25.00";
  const displayDate = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  // eslint-disable-next-line react-hooks/purity
  const displayRef = ref || `DON-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      <div className="flex flex-col items-center gap-6 max-w-[520px] mx-auto min-h-[60vh] justify-center">
        {/* Icon */}
        <Heart className="size-12 text-gold" />

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-[36px] font-semibold text-text-primary text-center">
          {t("title")}
        </h1>

        {/* Description */}
        <p className="font-sans text-[15px] text-text-secondary leading-[1.7] text-center">
          {t("description")}
          <br />
          <br />
          <em className="text-text-secondary/80">
            &ldquo;{t("quote")}&rdquo;
          </em>
        </p>

        {/* Receipt Card */}
        <div className="w-full max-w-[400px] bg-bg-card border border-border rounded-[10px] p-6 mt-2">
          <span className="font-mono text-[11px] font-medium text-text-muted tracking-[2px] uppercase">
            {t("receiptTitle")}
          </span>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-sans text-[13px] text-text-secondary">
                {t("amount")}
              </span>
              <span className="font-sans text-[13px] font-medium text-text-primary">
                {displayAmount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-[13px] text-text-secondary">
                {t("date")}
              </span>
              <span className="font-sans text-[13px] font-medium text-text-primary">
                {displayDate}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-[13px] text-text-secondary">
                {t("reference")}
              </span>
              <span className="font-mono text-xs font-medium text-text-primary">
                {displayRef}
              </span>
            </div>
          </div>
        </div>

        {/* Return button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gold text-bg font-sans text-sm font-semibold rounded-md px-7 py-3 hover:bg-honey transition-colors mt-2"
        >
          {t("returnHome")}
        </Link>
      </div>
    </section>
  );
}
