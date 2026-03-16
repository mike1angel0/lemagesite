"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorDetail("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send");
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorDetail(err instanceof Error ? err.message : "");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-serif text-2xl text-text-primary">{t("successTitle")}</p>
        <p className="font-sans text-sm text-text-secondary">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
      <Input
        id="name"
        label={t("formNameLabel")}
        type="text"
        placeholder={t("formNamePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        id="email"
        label={t("formEmailLabel")}
        type="email"
        placeholder={t("formEmailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="message"
          className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted"
        >
          {t("formMessageLabel")}
        </label>
        <textarea
          id="message"
          placeholder={t("formMessagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          className="w-full h-[120px] bg-transparent border border-border text-text-primary font-sans text-[13px] px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim resize-none"
        />
      </div>

      {status === "error" && (
        <p className="font-sans text-sm text-red-400">
          {t("errorMessage")}
          {errorDetail && <span className="block text-xs text-red-400/70 mt-1">{errorDetail}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-accent px-8 py-3.5 w-fit disabled:opacity-50"
      >
        <span className="font-sans text-[13px] font-medium text-text-on-accent">
          {status === "loading" ? t("sending") : t("sendMessage")}
        </span>
      </button>
    </form>
  );
}
