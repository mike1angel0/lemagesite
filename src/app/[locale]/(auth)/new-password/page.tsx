"use client";

import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { newPasswordAction, type AuthState } from "@/lib/actions/auth";

export default function NewPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [state, formAction, pending] = useActionState(newPasswordAction, {} as AuthState);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
        {/* Icon */}
        <KeyRound className="size-10 text-gold" />

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-text-primary text-center">
          {t("newPasswordTitle")}
        </h1>

        {/* Error message */}
        {state.error && (
          <p className="text-center font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2 w-full">
            {state.error}
          </p>
        )}

        {/* Form */}
        <form action={formAction} className="w-full flex flex-col gap-3 mt-2">
          <input type="hidden" name="token" value={token} />
          <Input
            id="new-password"
            name="password"
            label={t("passwordLabel")}
            type="password"
            placeholder="••••••••"
            required
          />

          <Button variant="gold" size="lg" className="w-full mt-2" disabled={pending}>
            {pending ? "..." : t("setPassword")}
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
