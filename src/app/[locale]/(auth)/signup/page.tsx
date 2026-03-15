"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { signUpAction, googleSignInAction, type AuthState } from "@/lib/actions/auth";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  const [state, formAction, pending] = useActionState(signUpAction, {} as AuthState);

  return (
    <>
      {/* -- Left Panel -- */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 max-w-lg mx-auto">
        {/* Logo */}
        <span className="font-serif text-lg tracking-widest text-warm-ivory mb-12">
          SELENARIUM
        </span>

        {/* Title */}
        <h1 className="font-serif text-2xl md:text-[36px] font-light text-text-primary text-center">
          {t("joinSelenarium")}
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-[13px] text-text-secondary leading-relaxed text-center mt-4 max-w-[340px] mx-auto">
          {t("signupSubtitle")}
        </p>

        {/* Error message */}
        {state.error && (
          <p className="mt-4 text-center font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
            {state.error}
          </p>
        )}

        {/* Form */}
        <form action={formAction} className="mt-8 space-y-4">
          <Input
            id="name"
            name="name"
            label={t("nameLabel")}
            type="text"
            placeholder="Your name"
            required
          />
          <Input
            id="email"
            name="email"
            label={t("emailLabel")}
            type="email"
            placeholder="you@example.com"
            required
          />
          <Input
            id="password"
            name="password"
            label={t("passwordLabel")}
            type="password"
            placeholder="••••••••"
            required
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label={t("confirmPasswordLabel")}
            type="password"
            placeholder="••••••••"
            required
          />

          <Button variant="filled" className="w-full h-12 mt-2" disabled={pending}>
            {pending ? tc("loading") : t("createAccount")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <span className="flex-1 h-px bg-border" />
          <span className="font-sans text-xs text-text-muted">{t("orDivider")}</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        {/* Google sign-in */}
        <form action={googleSignInAction}>
          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center gap-2 border border-border rounded text-text-secondary font-sans text-[13px] hover:border-accent-dim hover:text-text-primary transition-colors"
          >
            <Globe className="size-4" />
            {t("googleSignIn")}
          </button>
        </form>

        {/* Sign-in link */}
        <p className="mt-8 text-center">
          <span className="font-sans text-xs text-text-muted">
            {t("hasAccount")}{" "}
          </span>
          <Link
            href="/login"
            className="font-sans text-xs font-medium text-accent hover:text-accent-glow transition-colors"
          >
            {tc("signIn")}
          </Link>
        </p>

        {/* Terms notice */}
        <p className="font-sans text-[10px] text-text-muted leading-relaxed text-center mt-6 max-w-[340px] mx-auto">
          {t("signupTermsNotice")}
        </p>
      </div>

      {/* -- Right Panel -- */}
      <div className="hidden md:block w-[560px] bg-bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-bg-elevated" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-4">
          <p className="font-serif text-2xl font-light text-text-primary leading-snug max-w-[400px]">
            &ldquo;The only way to do great work is to love what you do.&rdquo;
          </p>
          <p className="font-mono text-[11px] text-accent-dim tracking-[1px]">
            &mdash; Steve Jobs
          </p>
        </div>
      </div>
    </>
  );
}
