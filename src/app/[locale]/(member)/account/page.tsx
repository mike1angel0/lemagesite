"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MemberBadge } from "@/components/ui/member-badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");

  const navItems = [
    { label: t("profile"), href: "#profile", active: true },
    { label: t("membership"), href: "#membership", active: false },
    { label: t("orders"), href: "#orders", active: false },
    { label: t("saved"), href: "#saved", active: false },
    { label: t("settings"), href: "#settings", active: false },
  ];

  return (
    <div className="px-5 md:px-10 xl:px-20 py-12">
      {/* -- Header -- */}
      <div className="flex items-center gap-6">
        {/* Avatar placeholder */}
        <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center font-serif text-2xl text-accent">
          MG
        </div>
        <div>
          <h1 className="font-serif text-2xl text-text-primary">
            Mihai Gavrilescu
          </h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            mihai@observatory.ink
          </p>
          <div className="mt-2">
            <MemberBadge tier="Patron" />
          </div>
        </div>
      </div>

      {/* -- Two-column layout -- */}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar */}
        <nav className="w-full md:w-60 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "block py-3 px-4 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded transition-colors",
                item.active && "bg-bg-elevated text-text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <div className="flex-1 space-y-8">
          {/* Profile card */}
          <Card>
            <h2 className="font-serif text-xl text-text-primary mb-6">
              {t("profileInformation")}
            </h2>
            <div className="space-y-4">
              <Input id="profile-name" label={t("profile")} defaultValue="Mihai Gavrilescu" />
              <Input
                id="profile-email"
                label="Email"
                type="email"
                defaultValue="mihai@observatory.ink"
              />
              <div className="flex flex-col">
                <label
                  htmlFor="profile-bio"
                  className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2"
                >
                  {t("bio")}
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  className="w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
                  defaultValue="Poet, photographer, and machine learning researcher."
                />
              </div>
              <Input
                id="profile-language"
                label={t("languagePreference")}
                defaultValue="English"
              />
            </div>
            <div className="mt-6">
              <Button variant="filled" onClick={() => alert("Changes saved")}>{tc("saveChanges")}</Button>
            </div>
          </Card>

          {/* Membership card */}
          <Card>
            <h2 className="font-serif text-xl text-text-primary mb-6">
              {t("membership")}
            </h2>
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">
                  {t("currentTier")}
                </span>
                <p className="font-sans text-sm text-text-primary mt-1">
                  Patron
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">
                  {t("renewalDate")}
                </span>
                <p className="font-sans text-sm text-text-primary mt-1">
                  April 15, 2026
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="filled" onClick={() => alert("Subscription management coming soon")}>{tc("manageSubscription")}</Button>
              <Button variant="ghost" onClick={() => alert("Cancel subscription coming soon")}>{tc("cancel")}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
