"use client";

import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PatronPage() {
  const t = useTranslations("patron");
  const tc = useTranslations("common");

  const stats = [
    { label: t("exclusivePieces").toUpperCase(), value: "47" },
    { label: t("audioReadings").toUpperCase(), value: "12" },
    { label: t("totalContributed").toUpperCase(), value: "\u20AC108", accent: true },
    { label: t("shopDiscount").toUpperCase(), value: "10%" },
  ];

  const patronContent = [
    {
      category: "Poetry \u00B7 Patron Exclusive",
      title: "Letters from the Dark Room",
      excerpt:
        "A sequence of poems written during the winter solstice, exploring the threshold between memory and invention.",
    },
    {
      category: "Essay \u00B7 Patron Exclusive",
      title: "The Grammar of Starlight",
      excerpt:
        "On the relationship between astronomical observation and the structure of metaphor in Romanian poetry.",
    },
    {
      category: "Audio \u00B7 Patron Exclusive",
      title: "Reading: Fog Studies I\u2013IV",
      excerpt:
        "An intimate reading of the Fog Studies cycle, recorded in the attic studio during a January rainstorm.",
    },
  ];

  const readingHistory = [
    { icon: BookOpen, title: "The Cartographers of Silence", date: "2 days ago" },
    { icon: Headphones, title: "Audio: Fog Studies I\u2013IV", date: "5 days ago" },
    { icon: BookOpen, title: "On the Architecture of Longing", date: "1 week ago" },
    { icon: Clock, title: "Neural Architectures and the Poetics of Attention", date: "2 weeks ago" },
  ];

  return (
    <div className="px-5 md:px-10 xl:px-20 py-12">
      {/* -- Welcome -- */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-warm-ivory">
          {t("welcomeBack")}
        </h1>
        <Button variant="ghost" onClick={() => alert("Subscription management coming soon")}>{tc("manageSubscription")}</Button>
      </div>

      {/* -- Stat Cards -- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-card border border-border rounded p-6"
          >
            <p
              className={`font-serif text-3xl ${stat.accent ? "text-gold" : "text-text-primary"}`}
            >
              {stat.value}
            </p>
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* -- New for Patrons -- */}
      <div className="mt-12">
        <SectionLabel label={t("newForPatrons").toUpperCase()} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {patronContent.map((item) => (
            <div
              key={item.title}
              className="bg-bg-card border border-border rounded p-6"
            >
              <span className="font-mono text-[9px] text-accent-dim tracking-[2px] uppercase">
                {item.category}
              </span>
              <h3 className="font-serif text-lg text-text-primary mt-3">
                {item.title}
              </h3>
              <p className="font-sans text-sm text-text-secondary mt-2 line-clamp-3">
                {item.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* -- Reading History -- */}
      <div className="mt-12">
        <SectionLabel label={t("readingHistory").toUpperCase()} />

        <div className="mt-6">
          {readingHistory.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-4 py-3 border-t border-border"
              >
                <Icon className="w-4 h-4 text-accent-dim shrink-0" />
                <span className="font-sans text-sm text-text-primary">
                  {item.title}
                </span>
                <span className="font-mono text-[10px] text-text-muted ml-auto">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
