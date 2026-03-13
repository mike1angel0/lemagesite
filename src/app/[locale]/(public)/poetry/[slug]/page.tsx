"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { ShareButtons } from "@/components/ui/share-buttons";

export default function PoemDetailPage() {
  const t = useTranslations("poetry");
  const tc = useTranslations("common");

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
          <span>Silence &amp; Space</span>
          <span className="block w-[3px] h-[3px] rounded-full bg-accent-dim" />
          <span>EN</span>
          <span className="block w-[3px] h-[3px] rounded-full bg-accent-dim" />
          <span>February 2026</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-[52px] font-light text-text-primary text-center leading-[1.2] max-w-[600px]">
          The Cartographers of Silence
        </h1>

        {/* Audio row */}
        <button
          type="button"
          onClick={() => alert("Audio playback coming soon")}
          className="inline-flex items-center gap-3 border border-border rounded-full px-6 py-3 font-sans text-xs text-accent tracking-[0.5px] hover:border-accent transition-colors"
        >
          <Play className="size-4" />
          <span>Listen to audio reading</span>
          <span className="font-mono text-[11px] text-text-muted">3:42</span>
        </button>

        {/* Divider */}
        <div className="w-10 h-px bg-accent-dim" />
      </div>

      {/* -- Hero image placeholder -- */}
      <div className="w-full h-[360px] px-20">
        <div className="w-full h-full bg-bg-surface rounded border border-border" />
      </div>

      {/* -- Poem body -- */}
      <div className="flex flex-col items-center gap-8 px-[420px] py-16">
        <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full">
          We mapped the spaces between words,{"\n"}
          the latitudes of unspoken thought —{"\n"}
          each silence a coordinate{"\n"}
          on a chart no one had drawn before.
        </p>

        <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full">
          The instruments were simple:{"\n"}
          a pen, a breath held too long,{"\n"}
          the distance between your hand{"\n"}
          and the page where it almost landed.
        </p>

        <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full">
          We measured the weight of pauses{"\n"}
          in conversations that ended{"\n"}
          before they began — the cartography{"\n"}
          of everything left unsaid.
        </p>

        <p className="font-serif text-[22px] font-light leading-[1.8] text-text-primary text-center w-full">
          And in the end, we found that silence{"\n"}
          had its own geography —{"\n"}
          vast, uncharted, beautiful,{"\n"}
          like the dark side of a familiar moon.
        </p>

        <div className="w-10 h-px bg-accent-dim" />

        <p className="font-mono text-[11px] text-accent-dim tracking-[1px] text-center">
          — Mihai Gavrilescu, from Nocturnal Echoes (2024)
        </p>
      </div>

      {/* -- Tip Jar -- */}
      <div className="flex flex-col items-center gap-4 px-[420px] py-8">
        <p className="font-serif text-xl text-text-secondary italic font-light text-center">
          Did this poem move you? Every tamed fox deserves a gift.
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
      <div className="flex justify-between items-center px-[200px] py-10">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
            Share
          </span>
          <ShareButtons />
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/poetry/observatory-notes-december"
            className="font-sans text-xs text-accent-dim hover:text-accent tracking-[0.5px] transition-colors"
          >
            ← Previous Poem
          </Link>
          <Link
            href="/poetry/neural-lullaby"
            className="font-sans text-xs text-accent hover:text-text-primary tracking-[0.5px] transition-colors"
          >
            Next Poem →
          </Link>
        </div>
      </div>

      {/* -- Partner Callout -- */}
      <div className="flex justify-center px-[200px] py-6">
        <Link href="/membership" className="flex items-center gap-3 bg-bg-card border border-border rounded-lg px-6 py-4 hover:border-gold/50 transition-colors">
          <span className="text-gold">🔖</span>
          <div>
            <p className="font-mono text-[10px] text-gold tracking-[2px] uppercase">
              Observatory Partner
            </p>
            <p className="font-sans text-xs text-text-secondary">
              Get early access to all poems + exclusive audio readings
            </p>
          </div>
        </Link>
      </div>

      {/* -- Related poems -- */}
      <section className="border-t border-border px-20 py-16">
        <SectionLabel label="MORE FROM THIS COLLECTION" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {[
            {
              title: "Neural Lullaby",
              collection: "Intelligence",
              slug: "/poetry/neural-lullaby",
            },
            {
              title: "Scrisoare catre nimeni",
              collection: "Longing",
              slug: "/poetry/scrisoare-catre-nimeni",
            },
            {
              title: "Observatory Notes, December",
              collection: "Silence & Space",
              slug: "/poetry/observatory-notes-december",
            },
          ].map((poem) => (
            <Link key={poem.slug} href={poem.slug}>
              <div className="border-t border-border pt-6 flex flex-col gap-3 hover:border-accent-dim transition-colors">
                <span className="font-mono text-[9px] text-accent-dim tracking-[2px] uppercase">
                  {poem.collection}
                </span>
                <h3 className="font-serif text-xl text-text-primary">
                  {poem.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
