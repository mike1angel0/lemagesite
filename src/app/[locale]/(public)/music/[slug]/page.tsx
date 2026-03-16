import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MusicPlayer } from "@/components/ui/music-player";
import { getAlbumBySlug } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";
import { PLACEHOLDER } from "@/lib/placeholders";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("music");

  const [album, config] = await Promise.all([getAlbumBySlug(slug), getSiteConfig()]);
  if (!album) notFound();

  const tracks = album.tracks.map((track, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: track.title,
    duration: track.duration ?? "",
  }));

  return (
    <section>
      {/* -- Hero -- */}
      <div className="flex gap-12 px-5 md:px-20 pt-20 pb-16">
        {/* Album Cover */}
        <div className="w-[340px] h-[340px] rounded-lg shrink-0 relative overflow-hidden">
          <Image src={album.coverImage ?? PLACEHOLDER.album} alt="Album cover" fill className="object-cover" />
        </div>

        {/* Album Info */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-accent-dim">
            {t("albumLabel")}
          </span>

          <h1 className="font-serif text-[42px] font-semibold text-text-primary leading-tight">
            {album.title}
          </h1>

          <p className="font-sans text-sm text-text-secondary">
            {album.year ?? ""} &middot; {album.trackCount} {t("tracks")} &middot; {album.duration ?? ""}
          </p>

          {album.description && (
            <p className="font-sans text-[15px] text-text-secondary leading-[1.6]">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {/* -- Tracklist & Player -- */}
      <div className="px-5 md:px-20">
        <MusicPlayer tracks={tracks} albumTitle={album.title} />
      </div>

      {/* -- Credits -- */}
      <div className="flex flex-col items-center gap-3 border-t border-border px-5 md:px-20 py-10">
        <span className="font-mono text-[11px] font-medium text-text-muted tracking-[2px]">
          {t("credits")}
        </span>
        <p className="font-sans text-[13px] text-text-secondary leading-[1.6] text-center max-w-[600px]">
          {t("creditsDescription", { handle: config.authorHandle.replace("@", ""), name: config.authorName })}
        </p>
        <div className="flex items-center gap-4 pt-3">
          {album.spotifyUrl && (
            <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-medium text-accent hover:text-accent-dim transition-colors">
              Spotify
            </a>
          )}
          {album.spotifyUrl && album.bandcampUrl && (
            <span className="text-text-muted">&middot;</span>
          )}
          {album.bandcampUrl && (
            <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-medium text-accent hover:text-accent-dim transition-colors">
              Bandcamp
            </a>
          )}
          {album.soundcloudUrl && (
            <>
              <span className="text-text-muted">&middot;</span>
              <a href={album.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-medium text-accent hover:text-accent-dim transition-colors">
                SoundCloud
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
