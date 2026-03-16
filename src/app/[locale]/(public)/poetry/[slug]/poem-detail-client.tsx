"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { ShareButtons } from "@/components/ui/share-buttons";
import { PoemImageGenerator } from "@/components/ui/poem-image-generator";
import { GatedOverlay } from "@/components/content/gated-overlay";
import { PLACEHOLDER } from "@/lib/placeholders";
import { SaveButton } from "@/components/ui/save-button";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/access";

type PoemData = {
  id: string;
  title: string;
  body: string;
  collection: string | null;
  language: string | null;
  audioUrl: string | null;
  accessTier: string;
  excerpt: string | null;
  publishedAt: string | null;
};

type RelatedPoem = {
  title: string;
  collection: string;
  slug: string;
};

export function PoemDetailClient({
  poem,
  prevSlug,
  nextSlug,
  relatedPoems,
  authorHandle,
}: {
  poem: PoemData;
  prevSlug: string | null;
  nextSlug: string | null;
  relatedPoems: RelatedPoem[];
  authorHandle?: string;
}) {
  const t = useTranslations("poetry");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stanzas = poem.body.split("\n\n").filter(Boolean);
  const userTier = (session?.user as Record<string, unknown>)?.tier as string | undefined;
  const canAccess = hasAccess(userTier, poem.accessTier);

  const publishedDate = poem.publishedAt
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
        new Date(poem.publishedAt)
      )
    : "";

  return (
    <article>
      {/* -- Hero Section -- */}
      <div className="flex flex-col items-center gap-6 pt-20 pb-16">
        {/* Back link */}
        <Link
          href="/poetry"
          className="inline-flex items-center gap-2 font-sans text-xs text-accent-dim hover:text-accent transition-colors self-start"
        >
          <span className="text-sm">←</span>
          {t("backToPoetry")}
        </Link>

        {/* Meta row */}
        <div className="flex items-center gap-4 font-mono text-[10px] text-accent-dim tracking-[2px] uppercase">
          <span>{poem.collection ?? ""}</span>
          <span className="block w-[3px] h-[3px] rounded-full bg-accent-dim" />
          <span>{(poem.language ?? "EN").toUpperCase()}</span>
          {publishedDate && (
            <>
              <span className="block w-[3px] h-[3px] rounded-full bg-accent-dim" />
              <span>{publishedDate}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-[52px] font-light text-text-primary text-center leading-[1.2] max-w-[600px]">
          {poem.title}
        </h1>

        {/* Audio row */}
        {poem.audioUrl && (
          <>
            <audio
              ref={audioRef}
              src={poem.audioUrl}
              onEnded={() => setAudioPlaying(false)}
              preload="none"
            />
            <button
              type="button"
              onClick={() => {
                if (!audioRef.current) return;
                if (audioPlaying) {
                  audioRef.current.pause();
                  setAudioPlaying(false);
                } else {
                  audioRef.current.play();
                  setAudioPlaying(true);
                }
              }}
              className="inline-flex items-center gap-3 border border-border rounded-full px-6 py-3 font-sans text-xs text-accent tracking-[0.5px] hover:border-accent transition-colors"
            >
              {audioPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              <span>{audioPlaying ? t("pauseAudio") : t("listenAudio")}</span>
            </button>
          </>
        )}

        {/* Divider */}
        <div className="w-10 h-px bg-accent-dim" />
      </div>

      {/* -- Poem body -- */}
      <div className="flex flex-col items-center gap-8 px-5 md:px-[420px] py-16 relative">
        {/* First stanza - always visible */}
        {stanzas.length > 0 && (
          <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full whitespace-pre-line">
            {stanzas[0]}
          </p>
        )}

        {canAccess ? (
          <>
            {stanzas.slice(1).map((stanza, i) => (
              <p
                key={i}
                className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full whitespace-pre-line"
              >
                {stanza}
              </p>
            ))}
          </>
        ) : stanzas.length > 1 ? (
          <div className="relative w-full">
            {/* Blurred preview */}
            <div className="blur-sm select-none pointer-events-none opacity-50">
              <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full whitespace-pre-line">
                {stanzas[1]}
              </p>
              {stanzas[2] && (
                <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full mt-8 whitespace-pre-line">
                  {stanzas[2]?.substring(0, 80)}...
                </p>
              )}
            </div>

            {/* Gated overlay */}
            <div className="absolute inset-0 flex items-end">
              <GatedOverlay
                contentType="poem"
                tier={poem.accessTier}
                className="w-full"
              />
            </div>
          </div>
        ) : null}

        {canAccess && (
          <>
            <div className="w-10 h-px bg-accent-dim" />
            <p className="font-mono text-[11px] text-accent-dim tracking-[1px] text-center">
              — {authorHandle || "lemagepoet"}
              {poem.collection ? `, from ${poem.collection}` : ""}
            </p>
          </>
        )}
      </div>

      {canAccess && (
        <>
          {/* -- Tip Jar -- */}
          <div className="flex flex-col items-center gap-4 px-5 md:px-[420px] py-8">
            <p className="font-serif text-xl text-text-secondary italic font-light text-center">
              {t("tipJarPrompt")}
            </p>
            <div className="flex gap-3">
              {["€2", "€5", "€10"].map((amount) => (
                <Link
                  key={amount}
                  href="/membership/payment"
                  className="inline-flex items-center gap-1.5 border border-border rounded-full px-4 py-2 font-mono text-[11px] text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors"
                >
                  <span>☕</span>
                  {amount}
                </Link>
              ))}
            </div>
          </div>

          {/* -- Action bar -- */}
          <div className="flex justify-between items-center px-5 md:px-[200px] py-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                  {tc("share")}
                </span>
                <ShareButtons />
              </div>
              <PoemImageGenerator
                title={poem.title}
                stanzas={stanzas}
                bgImage={PLACEHOLDER.poem}
              />
              <SaveButton
                contentType="POEM"
                contentId={poem.id}
                saved={false}
              />
            </div>
            <div className="flex items-center gap-6">
              {prevSlug && (
                <Link
                  href={prevSlug}
                  className="font-sans text-xs text-accent-dim hover:text-accent tracking-[0.5px] transition-colors"
                >
                  ← {t("previousPoem")}
                </Link>
              )}
              {nextSlug && (
                <Link
                  href={nextSlug}
                  className="font-sans text-xs text-accent hover:text-text-primary tracking-[0.5px] transition-colors"
                >
                  {t("nextPoem")} →
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {/* -- Partner Callout -- */}
      <div className="flex justify-center px-5 md:px-[200px] py-6">
        <Link
          href="/membership"
          className="flex items-center gap-3 bg-bg-card border border-border rounded-lg px-6 py-4 hover:border-gold/50 transition-colors"
        >
          <span className="text-gold">🔖</span>
          <div>
            <p className="font-mono text-[10px] text-gold tracking-[2px] uppercase">
              {t("partnerBadge")}
            </p>
            <p className="font-sans text-xs text-text-secondary">
              {t("partnerDescription")}
            </p>
          </div>
        </Link>
      </div>

      {/* -- Related poems -- */}
      {relatedPoems.length > 0 && (
        <section className="border-t border-border px-5 md:px-20 py-16">
          <SectionLabel label={t("moreFromCollection")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {relatedPoems.map((p) => (
              <Link key={p.slug} href={p.slug}>
                <div className="border-t border-border pt-6 flex flex-col gap-3 hover:border-accent-dim transition-colors">
                  <span className="font-mono text-[9px] text-accent-dim tracking-[2px] uppercase">
                    {p.collection}
                  </span>
                  <h3 className="font-serif text-xl text-text-primary">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
