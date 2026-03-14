"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const tracks = [
  { number: "01", title: "First Light", duration: "5:23", active: false },
  { number: "02", title: "Radio Silence", duration: "6:41", active: true },
  { number: "03", title: "The Cartographer's Dream", duration: "4:58", active: false },
  { number: "04", title: "Meridian", duration: "5:12", active: false },
  { number: "05", title: "Telescope Motors", duration: "7:02", active: false },
  { number: "06", title: "Letters from Dead Stars", duration: "4:37", active: false },
  { number: "07", title: "The Republic of Shadows", duration: "3:48", active: false },
  { number: "08", title: "Nocturne (Closing)", duration: "4:19", active: false },
];

export default function AlbumDetailPage() {
  const t = useTranslations("music");
  const tc = useTranslations("common");

  return (
    <section>
      {/* -- Hero -- */}
      <div className="flex gap-12 px-20 pt-20 pb-16">
        {/* Album Cover */}
        <div className="w-[340px] h-[340px] bg-bg-surface rounded-lg shrink-0" />

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

          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              size="md"
              onClick={() => alert("Audio playback coming soon")}
            >
              Play Album
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => alert("Share link copied to clipboard")}
            >
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* -- Tracklist -- */}
      <div className="px-20">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <span className="font-mono text-[11px] text-text-muted w-12">#</span>
          <span className="font-mono text-[11px] text-text-muted flex-1">
            Title
          </span>
          <span className="font-mono text-[11px] text-text-muted">
            Duration
          </span>
        </div>

        {/* Tracks */}
        {tracks.map((track) => (
          <div
            key={track.number}
            className={`flex items-center px-4 py-3.5 border-b border-border ${
              track.active ? "bg-bg-elevated" : ""
            }`}
          >
            <span
              className={`font-mono text-[13px] w-12 ${
                track.active ? "text-gold" : "text-text-muted"
              }`}
            >
              {track.number}
            </span>
            <span
              className={`font-sans text-sm flex-1 ${
                track.active ? "text-gold font-medium" : "text-text-primary"
              }`}
            >
              {track.title}
              {track.active && (
                <span className="ml-2 text-gold text-xs">NOW PLAYING</span>
              )}
            </span>
            <span
              className={`font-mono text-[13px] ${
                track.active ? "text-gold" : "text-text-secondary"
              }`}
            >
              {track.duration}
            </span>
          </div>
        ))}
      </div>

      {/* -- Credits -- */}
      <div className="flex flex-col items-center gap-3 border-t border-border px-20 py-10">
        <span className="font-mono text-[11px] font-medium text-text-muted tracking-[2px]">
          Credits
        </span>
        <p className="font-sans text-[13px] text-text-secondary leading-[1.6] text-center max-w-[600px]">
          Composed, performed, and produced by Mihai Gavrilescu. Recorded at the
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
