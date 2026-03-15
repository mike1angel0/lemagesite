"use client";

import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  const [state, formAction, pending] = useActionState(resetPasswordAction, {} as AuthState);

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

        {/* Success message */}
        {state.success && (
          <p className="text-center font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2 w-full">
            {t("resetLinkSent")}
          </p>
        )}

        {/* Error message */}
        {state.error && (
          <p className="text-center font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2 w-full">
            {state.error}
          </p>
        )}

        {/* Form */}
        {!state.success && (
          <form action={formAction} className="w-full flex flex-col gap-3 mt-2">
            <Input
              id="reset-email"
              name="email"
              label={t("emailLabel")}
              type="email"
              placeholder="you@example.com"
              required
            />

            <Button variant="gold" size="lg" className="w-full mt-2" disabled={pending}>
              {pending ? "..." : t("sendResetLink")}
            </Button>
          </form>
        )}

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
