"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  return (
    <>
      {/* -- Left Panel -- */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 max-w-lg mx-auto">
        {/* Logo */}
        <span className="font-serif text-lg tracking-widest text-warm-ivory mb-12">
          THE OBSERVATORY
        </span>

        {/* Title */}
        <h1 className="font-serif text-2xl md:text-[36px] font-light text-text-primary text-center">
          {t("joinObservatory")}
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-[13px] text-text-secondary leading-relaxed text-center mt-4 max-w-[340px] mx-auto">
          {t("signupSubtitle")}
        </p>

        {/* Form */}
        <form className="mt-8 space-y-4">
          <Input
            id="name"
            label={t("nameLabel")}
            type="text"
            placeholder="Your name"
          />
          <Input
            id="email"
            label={t("emailLabel")}
            type="email"
            placeholder="you@example.com"
          />
          <Input
            id="password"
            label={t("passwordLabel")}
            type="password"
            placeholder="••••••••"
          />
          <Input
            id="confirm-password"
            label={t("confirmPasswordLabel")}
            type="password"
            placeholder="••••••••"
          />

          <Button variant="filled" className="w-full h-12 mt-2">
            {t("createAccount")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <span className="flex-1 h-px bg-border" />
          <span className="font-sans text-xs text-text-muted">{t("orDivider")}</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={() => alert("Google sign-in coming soon")}
          className="w-full h-11 flex items-center justify-center gap-2 border border-border rounded text-text-secondary font-sans text-[13px] hover:border-accent-dim hover:text-text-primary transition-colors"
        >
          <Globe className="size-4" />
          {t("googleSignIn")}
        </button>

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
        {/* Background image placeholder */}
        <div className="absolute inset-0 bg-bg-elevated" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />

        {/* Quote overlay */}
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
