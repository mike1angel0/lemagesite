"use client";

import { MusicPlayer, type Track } from "@/components/ui/music-player";

const tracks: Track[] = [
  { number: "01", title: "The Weight of Light", duration: "4:12" },
  { number: "02", title: "Cartographer", duration: "3:47" },
  { number: "03", title: "Neural Lullaby", duration: "5:03" },
  { number: "04", title: "Selenarium, December", duration: "3:28" },
  { number: "05", title: "Letters to No One", duration: "4:55" },
  { number: "06", title: "Fog Variations", duration: "6:01" },
  { number: "07", title: "The Last Magician", duration: "4:33" },
];

export function MusicTracklist() {
  return <MusicPlayer tracks={tracks} albumTitle="Nocturnal Echoes" />;
}
