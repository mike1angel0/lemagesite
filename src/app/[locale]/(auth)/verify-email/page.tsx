"use client";

import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { resendVerificationAction, type AuthState } from "@/lib/actions/auth";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [state, formAction, pending] = useActionState(resendVerificationAction, {} as AuthState);

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

        {/* Success message */}
        {state.success && (
          <p className="text-center font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
            {t("verificationResent")}
          </p>
        )}

        {/* Resend link */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-[13px] text-text-muted">
            {t("didntReceive")}
          </span>
          <form action={formAction}>
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              disabled={pending}
              className="font-sans text-[13px] text-accent hover:text-accent-glow transition-colors disabled:opacity-50"
            >
              {pending ? "..." : t("resendVerification")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
