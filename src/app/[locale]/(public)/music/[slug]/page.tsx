"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MusicPlayer, type Track } from "@/components/ui/music-player";

const tracks: Track[] = [
  { number: "01", title: "First Light", duration: "5:23" },
  { number: "02", title: "Radio Silence", duration: "6:41" },
  { number: "03", title: "The Cartographer's Dream", duration: "4:58" },
  { number: "04", title: "Meridian", duration: "5:12" },
  { number: "05", title: "Telescope Motors", duration: "7:02" },
  { number: "06", title: "Letters from Dead Stars", duration: "4:37" },
  { number: "07", title: "The Republic of Shadows", duration: "3:48" },
  { number: "08", title: "Nocturne (Closing)", duration: "4:19" },
];

export default function AlbumDetailPage() {
  const t = useTranslations("music");
  const tc = useTranslations("common");

  return (
    <section>
      {/* -- Hero -- */}
      <div className="flex gap-12 px-20 pt-20 pb-16">
        {/* Album Cover */}
        <div className="w-[340px] h-[340px] rounded-lg shrink-0 relative overflow-hidden">
          <Image src="/design-exports/uPDIn.png" alt="Album cover" fill className="object-cover" />
        </div>

        {/* Album Info */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-accent-dim">
            ALBUM
          </span>

          <h1 className="font-serif text-[42px] font-semibold text-text-primary leading-tight">
            Nocturnal Echoes
          </h1>

          <p className="font-sans text-sm text-text-secondary">
            2024 &middot; 8 tracks &middot; 42 min
          </p>

          <p className="font-sans text-[15px] text-text-secondary leading-[1.6]">
            A collection of ambient compositions inspired by the sounds of the
            selenarium at night — telescope motors, distant radio signals, and
            the silence between stars.
          </p>

        </div>
      </div>

      {/* -- Tracklist & Player -- */}
      <div className="px-20">
        <MusicPlayer tracks={tracks} albumTitle="Nocturnal Echoes" />
      </div>

      {/* -- Credits -- */}
      <div className="flex flex-col items-center gap-3 border-t border-border px-20 py-10">
        <span className="font-mono text-[11px] font-medium text-text-muted tracking-[2px]">
          Credits
        </span>
        <p className="font-sans text-[13px] text-text-secondary leading-[1.6] text-center max-w-[600px]">
          Composed, performed, and produced by lemagepoet (Mihai Gavrilescu). Recorded at the
          Cosmic Selenarium, 2024. Mixed and mastered at Studio Nocturn,
          Bucharest. Track 7 contains a hidden message when played backwards
          (just kidding — or am I?).
        </p>
        <div className="flex items-center gap-4 pt-3">
          <span className="font-mono text-xs font-medium text-accent">
            Spotify
          </span>
          <span className="text-text-muted">&middot;</span>
          <span className="font-mono text-xs font-medium text-accent">
            Apple Music
          </span>
          <span className="text-text-muted">&middot;</span>
          <span className="font-mono text-xs font-medium text-accent">
            Bandcamp
          </span>
        </div>
      </div>
    </section>
  );
}
