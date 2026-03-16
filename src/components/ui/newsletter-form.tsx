"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";

interface NewsletterFormProps {
  source?: string;
  className?: string;
}

export function NewsletterForm({ source = "footer", className }: NewsletterFormProps) {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (!res.ok) throw new Error("Failed to subscribe");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="font-sans text-sm text-accent">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-wrap items-center gap-0">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label={t("subscribe")}
          className="w-full max-w-[320px]"
        />
        <Button type="submit" variant="filled" size="md" disabled={status === "loading"}>
          {status === "loading" ? t("subscribing") : t("subscribe")}
        </Button>
      </div>
      {status === "error" && (
        <p className="font-sans text-xs text-red-400 mt-2">{t("error")}</p>
      )}
    </form>
  );
}
