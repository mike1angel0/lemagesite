import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";

const tracks = [
  { number: "01", title: "The Weight of Light", duration: "4:12" },
  { number: "02", title: "Cartographer", duration: "3:47" },
  { number: "01", title: "The Weight of Light", duration: "4:12" },
  { number: "02", title: "Cartographer", duration: "3:47" },
  { number: "03", title: "Neural Lullaby", duration: "5:03" },
  { number: "04", title: "Observatory, December", duration: "3:28" },
  { number: "05", title: "Letters to No One", duration: "4:55" },
];

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
        {/* Album Art Placeholder */}
        <div className="w-full md:w-[380px] h-[380px] bg-bg-surface border border-border rounded shrink-0" />

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

          {/* Tracklist */}
          <div className="mt-8">
            {tracks.map((track) => (
              <div
                key={track.number}
                className="flex justify-between items-center py-3 border-t border-border"
              >
                <span className="font-mono text-[11px] text-text-muted w-8">
                  {track.number}
                </span>
                <span className="font-sans text-[13px] text-text-primary flex-1">
                  {track.title}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  {track.duration}
                </span>
              </div>
            ))}
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

      {/* ── Embedded Player Placeholder ── */}
      <div className="h-[120px] bg-bg-card border border-border mt-16 flex flex-col items-center justify-center gap-4 p-8">
        <svg className="size-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <span className="font-mono text-[11px] text-text-muted tracking-[1px]">
          {t("embeddedPlayer")}
        </span>
      </div>
    </section>
    </>
  );
}
