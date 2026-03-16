import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function UnsubscribedPage() {
  const t = await getTranslations("newsletter");

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-5 py-20 text-center">
      <h1 className="font-serif text-3xl text-text-primary mb-4">
        {t("unsubscribedTitle")}
      </h1>
      <p className="font-sans text-sm text-text-secondary max-w-md mb-8">
        {t("unsubscribedDescription")}
      </p>
      <Link
        href="/"
        className="font-mono text-xs text-accent hover:text-gold transition-colors tracking-[1px]"
      >
        {t("backToHome")}
      </Link>
    </section>
  );
}
