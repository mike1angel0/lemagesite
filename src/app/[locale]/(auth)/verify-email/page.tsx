import { MailCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function VerifyEmailPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center gap-6 w-full max-w-[460px]">
        {/* Icon */}
        <MailCheck className="size-12 text-accent" />

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-[42px] font-light text-warm-ivory text-center">
          {t("verifyTitle")}
        </h1>

        {/* Description */}
        <p className="font-sans text-sm text-text-secondary leading-relaxed text-center">
          {t("verifyDescription")}
          <br />
          <br />
          {t("verifyExpiry")}
        </p>

        {/* Resend link */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-[13px] text-text-muted">
            {t("didntReceive")}
          </span>
          <button
            type="button"
            className="font-sans text-[13px] text-accent hover:text-accent-glow transition-colors"
          >
            {t("resendVerification")}
          </button>
        </div>
      </div>
    </div>
  );
}
