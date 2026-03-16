"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReadAloudButtonProps {
  contentType: string;
  contentId: string;
  audioUrl?: string | null;
}

export function ReadAloudButton({ contentType, contentId, audioUrl: initialAudioUrl }: ReadAloudButtonProps) {
  const t = useTranslations("common");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(initialAudioUrl ?? null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = useCallback(async () => {
    // If playing, pause
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    // If we already have a source, just play
    if (audioSrc && audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    // Generate audio via API
    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "TTS failed");
      setAudioSrc(data.url);

      // Wait for next tick so the <audio> element picks up the new src
      setTimeout(() => {
        audioRef.current?.play();
        setPlaying(true);
      }, 100);
    } catch (err) {
      console.error("TTS generation failed:", err);
    } finally {
      setLoading(false);
    }
  }, [playing, audioSrc, contentType, contentId]);

  return (
    <>
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onEnded={() => setPlaying(false)}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2.5 font-sans text-xs text-accent tracking-[0.5px] hover:border-accent transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : playing ? (
          <VolumeX className="size-4" />
        ) : (
          <Volume2 className="size-4" />
        )}
        <span>
          {loading ? t("loading") : playing ? t("stopListening") : t("listen")}
        </span>
      </button>
    </>
  );
}
