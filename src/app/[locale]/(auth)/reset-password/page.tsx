import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
        {/* Icon */}
        <KeyRound className="size-10 text-gold" />

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-text-primary text-center">
          {t("resetTitle")}
        </h1>

        {/* Description */}
        <p className="font-sans text-[15px] text-text-secondary leading-relaxed text-center">
          {t("resetDescription")}
        </p>

        {/* Form */}
        <form className="w-full flex flex-col gap-3 mt-2">
          <Input
            id="reset-email"
            label={t("emailLabel")}
            type="email"
            placeholder="you@example.com"
          />

          <Button variant="gold" size="lg" className="w-full mt-2">
            {t("sendResetLink")}
          </Button>
        </form>

        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-sans text-[13px] text-accent-dim hover:text-accent transition-colors mt-2"
        >
          <ArrowLeft className="size-3.5" />
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
