"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, Loader2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReadAloudButtonProps {
  contentType: string;
  contentId: string;
  audioUrl?: string | null;
  audioUrlRo?: string | null;
  locale?: string;
}

export function ReadAloudButton({ contentType, contentId, audioUrl: initialAudioUrl, audioUrlRo, locale }: ReadAloudButtonProps) {
  const t = useTranslations("common");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const cachedUrl = locale === "ro" ? audioUrlRo : initialAudioUrl;
  const [audioSrc, setAudioSrc] = useState<string | null>(cachedUrl ?? null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAudio = useCallback(async (regenerate: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, locale: locale || "en", regenerate }),
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
  }, [contentType, contentId, locale]);

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
    await fetchAudio(false);
  }, [playing, audioSrc, fetchAudio]);

  const regenerate = useCallback(async () => {
    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
    setAudioSrc(null);
    await fetchAudio(true);
  }, [fetchAudio]);

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
      {audioSrc && !loading && (
        <button
          type="button"
          onClick={regenerate}
          title={t("regenerateAudio")}
          className="inline-flex items-center justify-center border border-border rounded-full p-2.5 text-text-muted hover:text-accent hover:border-accent transition-colors"
        >
          <RefreshCw className="size-3.5" />
        </button>
      )}
    </>
  );
}
