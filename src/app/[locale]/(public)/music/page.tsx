import Image from "next/image";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { MusicTracklist } from "./music-tracklist";
import { getAlbumsWithTracks, getPageContent } from "@/lib/data";
import { PLACEHOLDER } from "@/lib/placeholders";

export default async function MusicPage() {
  const t = await getTranslations("music");
  const locale = await getLocale();
  const content = await getPageContent("music", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const albums = await getAlbumsWithTracks();
  const album = albums[0]; // Primary album

  return (
    <>
    <section className="flex flex-col items-center py-20 px-5 md:px-10 xl:px-20 pb-16">
      {/* ── Hero ── */}
      <SectionLabel label={content.sectionLabel} className="justify-center" />

      <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary leading-[1.15] max-w-[600px] mt-6 text-center whitespace-pre-line">
        {content.heroTitle}
      </h1>

      <p className="font-sans text-sm text-text-secondary mt-6 max-w-[560px] leading-relaxed text-center">
        {content.heroDescription}
      </p>
    </section>

    {album && (
      <section className="px-5 md:px-10 xl:px-20 pb-20">
        {/* ── Album Section ── */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-[60px]">
          {/* Album Art */}
          <Link href={`/music/${album.slug}`} className="w-full md:w-[380px] h-[380px] border border-border rounded shrink-0 relative overflow-hidden">
            <Image src={album.coverImage ?? PLACEHOLDER.album} alt="Album art" fill className="object-cover" />
          </Link>

          {/* Album Info */}
          <div className="flex-1">
            <span className="font-mono text-[10px] text-accent-dim tracking-[2px]">
              {t("albumLabel")} &middot; {album.year ?? ""}
            </span>

            <h2 className="font-serif text-3xl md:text-[40px] font-light text-text-primary mt-2 leading-tight">
              <Link href={`/music/${album.slug}`}>{album.title}</Link>
            </h2>

            <p className="font-sans text-sm text-text-secondary mt-4 max-w-[500px] leading-relaxed">
              {album.description ?? t("albumDescription")}
            </p>

            {/* Tracklist & Player */}
            <div className="mt-8">
              <MusicTracklist />
            </div>

            {/* Stream Links */}
            <div className="flex items-center gap-5 mt-6">
              {album.spotifyUrl && (
                <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-text-secondary text-xs font-sans hover:border-accent-dim transition-colors">
                  <svg className="size-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {t("streamSpotify")}
                </a>
              )}
              {album.bandcampUrl && (
                <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-text-secondary text-xs font-sans hover:border-accent-dim transition-colors">
                  {t("streamBandcamp")}
                </a>
              )}
              {album.soundcloudUrl && (
                <a href={album.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-text-secondary text-xs font-sans hover:border-accent-dim transition-colors">
                  {t("streamSoundCloud")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    )}
    </>
  );
}
