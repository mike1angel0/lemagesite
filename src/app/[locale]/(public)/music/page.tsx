import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { MusicTracklist } from "./music-tracklist";

export default async function MusicPage() {
  const t = await getTranslations("music");

  return (
    <>
    <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-16">
      {/* ── Hero ── */}
      <SectionLabel label={t("sectionLabel")} className="justify-center" />

      <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary leading-[1.15] max-w-[600px] mt-6 text-center whitespace-pre-line">
        {t("heroTitle")}
      </h1>

      <p className="font-sans text-sm text-text-secondary mt-6 max-w-[560px] leading-relaxed text-center">
        {t("heroDescription")}
      </p>
    </section>

    <section className="px-5 md:px-10 xl:px-20 pb-20">
      {/* ── Album Section ── */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-[60px]">
        {/* Album Art */}
        <div className="w-full md:w-[380px] h-[380px] border border-border rounded shrink-0 relative overflow-hidden">
          <Image src="/design-exports/BbRIG.png" alt="Album art" fill className="object-cover" />
        </div>

        {/* Album Info */}
        <div className="flex-1">
          <span className="font-mono text-[10px] text-accent-dim tracking-[2px]">
            {t("albumLabel")} &middot; 2025
          </span>

          <h2 className="font-serif text-3xl md:text-[40px] font-light text-text-primary mt-2 leading-tight">
            Nocturnal Echoes
          </h2>

          <p className="font-sans text-sm text-text-secondary mt-4 max-w-[500px] leading-relaxed">
            {t("albumDescription")}
          </p>

          {/* Tracklist & Player */}
          <div className="mt-8">
            <MusicTracklist />
          </div>

          {/* Stream Links */}
          <div className="flex items-center gap-5 mt-6">
            <span className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-text-secondary text-xs font-sans">
              <svg className="size-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {t("streamSpotify")}
            </span>
            <span className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-text-secondary text-xs font-sans">
              {t("streamBandcamp")}
            </span>
            <span className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-text-secondary text-xs font-sans">
              {t("streamSoundCloud")}
            </span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
