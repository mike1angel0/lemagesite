import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";

export default async function TermsPage() {
  const t = await getTranslations("legal");

  return (
    <section className="px-5 md:px-10 xl:px-20 py-20">
      <SectionLabel label={t("label").toUpperCase()} />

      <h1 className="font-serif text-4xl md:text-[48px] font-light text-warm-ivory mt-6 leading-tight">
        {t("termsTitle")}
      </h1>

      <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[1px]">
        {t("lastUpdated").toUpperCase()}: MARCH 1, 2026
      </p>

      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection1Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection1Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection2Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection2Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection3Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection3Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection4Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection4Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection5Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection5Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection6Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection6Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("termsSection7Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("termsSection7Body")}
        </p>
      </div>
    </section>
  );
}
