"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Track {
  number: string;
  title: string;
  duration: string;
  audioUrl?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  albumTitle?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayer({ tracks, albumTitle }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const currentTrack = currentIndex !== null ? tracks[currentIndex] : null;

  const play = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = tracks[index];

    if (currentIndex === index) {
      // Toggle play/pause on same track
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    // New track
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);

    if (track.audioUrl) {
      audio.src = track.audioUrl;
      audio.load();
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      // No audio URL — just highlight the track
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentIndex, isPlaying, tracks]);

  const playPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex === null) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentIndex, isPlaying]);

  const skipNext = useCallback(() => {
    if (currentIndex === null) {
      play(0);
    } else {
      play((currentIndex + 1) % tracks.length);
    }
  }, [currentIndex, play, tracks.length]);

  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    if (currentIndex === null) return;

    // If more than 3 seconds in, restart current track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    play((currentIndex - 1 + tracks.length) % tracks.length);
  }, [currentIndex, play, tracks.length]);

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }

  function changeVolume(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.volume = ratio;
    setVolume(ratio);
    if (ratio > 0 && muted) {
      audio.muted = false;
      setMuted(false);
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      // Auto-advance to next track
      if (currentIndex !== null && currentIndex < tracks.length - 1) {
        play(currentIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, play, tracks.length]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />

      {/* Tracklist */}
      <div>
        {tracks.map((track, i) => {
          const isActive = currentIndex === i;
          const isTrackPlaying = isActive && isPlaying;

          return (
            <button
              key={track.number}
              type="button"
              onClick={() => play(i)}
              className={cn(
                "flex items-center w-full px-4 py-3.5 border-b border-border text-left transition-colors group",
                isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
              )}
            >
              {/* Track number / play icon */}
              <span className={cn("w-12 shrink-0", isActive ? "text-gold" : "text-text-muted")}>
                {isActive ? (
                  isTrackPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )
                ) : (
                  <span className="font-mono text-[13px] group-hover:hidden">{track.number}</span>
                )}
                {!isActive && (
                  <Play className="size-4 text-text-muted hidden group-hover:block" />
                )}
              </span>

              {/* Title */}
              <span
                className={cn(
                  "font-sans text-sm flex-1",
                  isActive ? "text-gold font-medium" : "text-text-primary"
                )}
              >
                {track.title}
              </span>

              {/* Duration */}
              <span
                className={cn(
                  "font-mono text-[13px]",
                  isActive ? "text-gold" : "text-text-secondary"
                )}
              >
                {track.duration}
              </span>
            </button>
          );
        })}
      </div>

      {/* Player bar — shown when a track is selected */}
      {currentTrack && (
        <div className="mt-6 bg-bg-card border border-border rounded-lg p-5">
          {/* Track info */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-sans text-sm font-medium text-text-primary">
                {currentTrack.title}
              </p>
              {albumTitle && (
                <p className="font-sans text-xs text-text-muted">{albumTitle}</p>
              )}
            </div>
            <span className="font-mono text-[11px] text-text-muted">
              {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : currentTrack.duration}
            </span>
          </div>

          {/* Progress bar */}
          <div
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            tabIndex={0}
            className="h-1.5 bg-border rounded-full cursor-pointer group mb-4"
            onClick={seek}
          >
            <div
              className="h-full bg-gold rounded-full relative transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={skipPrev}
                aria-label="Previous track"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <SkipBack className="size-4" />
              </button>

              <button
                type="button"
                onClick={playPause}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="w-9 h-9 rounded-full bg-gold flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="size-4 text-bg" />
                ) : (
                  <Play className="size-4 text-bg ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={skipNext}
                aria-label="Next track"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <SkipForward className="size-4" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
              <div
                role="slider"
                aria-label="Volume"
                aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                className="w-20 h-1 bg-border rounded-full cursor-pointer"
                onClick={changeVolume}
              >
                <div
                  className="h-full bg-text-muted rounded-full"
                  style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
