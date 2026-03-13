import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";

export default async function PrivacyPage() {
  const t = await getTranslations("legal");

  return (
    <section className="px-5 md:px-10 xl:px-20 py-20">
      <SectionLabel label={t("label").toUpperCase()} />

      <h1 className="font-serif text-4xl md:text-[48px] font-light text-warm-ivory mt-6 leading-tight">
        {t("privacyTitle")}
      </h1>

      <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[1px]">
        {t("lastUpdated").toUpperCase()}: MARCH 1, 2026
      </p>

      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection1Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection1Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection2Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection2Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection3Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection3Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection4Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection4Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection5Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection5Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection6Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection6Body")}
        </p>

        <h2 className="font-serif text-xl md:text-2xl text-text-primary mt-10 mb-4">
          {t("privacySection7Title")}
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7]">
          {t("privacySection7Body")}
        </p>
      </div>
    </section>
  );
}
