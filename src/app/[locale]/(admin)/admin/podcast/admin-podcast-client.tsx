"use client";

import { useState, useRef, useActionState } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Download,
  Play,
  Pause,
  Import,
  Plus,
  X,
  Mic,
  Rss,
} from "lucide-react";
import {
  createPodcastEpisodeAction,
  deletePodcastEpisodeAction,
  importContentAudioAction,
} from "@/lib/actions/podcast";
import type { AuthState } from "@/lib/actions/auth";

const tabs = ["All Episodes", "From Content", "Standalone", "Unlinked Audio"];

const typeBadgeColors: Record<string, string> = {
  POEM: "bg-accent/10 text-accent",
  ESSAY: "bg-gold/10 text-gold",
  RESEARCH: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  standalone: "bg-text-muted/10 text-text-muted",
};

interface EpisodeRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  duration: string | null;
  coverImage: string | null;
  contentType: string | null;
  contentId: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface UnlinkedAudioItem {
  id: string;
  title: string;
  slug: string;
  contentType: "POEM" | "ESSAY" | "RESEARCH";
  audioUrl: string;
  locale: "en" | "ro";
}

interface Summary {
  total: number;
  fromContent: number;
  standalone: number;
  unlinked: number;
}

export function AdminPodcastClient({
  episodes: initialEpisodes,
  fromContent: initialFromContent,
  standalone: initialStandalone,
  unlinkedAudio: initialUnlinked,
  summary,
}: {
  episodes: EpisodeRow[];
  fromContent: EpisodeRow[];
  standalone: EpisodeRow[];
  unlinkedAudio: UnlinkedAudioItem[];
  summary: Summary;
}) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [fromContent, setFromContent] = useState(initialFromContent);
  const [standaloneEps, setStandaloneEps] = useState(initialStandalone);
  const [unlinked, setUnlinked] = useState(initialUnlinked);
  const [activeTab, setActiveTab] = useState("All Episodes");
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [, deleteAction] = useActionState(deletePodcastEpisodeAction, {} as AuthState);
  const [, importAction] = useActionState(importContentAudioAction, {} as AuthState);
  const [createState, createAction] = useActionState(createPodcastEpisodeAction, {} as AuthState);

  function handlePlay(url: string) {
    if (playingUrl === url) {
      audioRef.current?.pause();
      setPlayingUrl(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => setPlayingUrl(null);
    audioRef.current = audio;
    setPlayingUrl(url);
  }

  async function handleDownload(url: string, slug: string) {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  }

  function handleDelete(ep: EpisodeRow) {
    if (!confirm(`Delete "${ep.title}"?`)) return;
    setEpisodes((prev) => prev.filter((e) => e.id !== ep.id));
    setFromContent((prev) => prev.filter((e) => e.id !== ep.id));
    setStandaloneEps((prev) => prev.filter((e) => e.id !== ep.id));
    const fd = new FormData();
    fd.set("id", ep.id);
    deleteAction(fd);
  }

  function handleImport(item: UnlinkedAudioItem) {
    setUnlinked((prev) => prev.filter((u) => !(u.id === item.id && u.locale === item.locale)));
    const fd = new FormData();
    fd.set("contentType", item.contentType);
    fd.set("contentId", item.id);
    fd.set("title", item.title);
    fd.set("audioUrl", item.audioUrl);
    fd.set("locale", item.locale);
    importAction(fd);
  }

  const stats = [
    { label: "TOTAL EPISODES", value: String(summary.total) },
    { label: "FROM CONTENT", value: String(summary.fromContent) },
    { label: "STANDALONE", value: String(summary.standalone) },
    { label: "UNLINKED AUDIO", value: String(summary.unlinked) },
  ];

  function getRows(): EpisodeRow[] {
    if (activeTab === "From Content") return fromContent;
    if (activeTab === "Standalone") return standaloneEps;
    return episodes;
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Podcast</h1>
        <div className="flex items-center gap-3">
          <a
            href="/feed/podcast/poetry.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-sans text-xs text-text-muted hover:text-accent transition-colors"
          >
            <Rss size={12} />
            Poetry RSS
          </a>
          <a
            href="/feed/podcast/essays.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-sans text-xs text-text-muted hover:text-accent transition-colors"
          >
            <Rss size={12} />
            Essays RSS
          </a>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Episode
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-lg p-5">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">{stat.label}</p>
            <p className="font-serif text-[32px] font-light text-text-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-8 mt-8">
        <div className="border-b border-border pb-4 mb-0">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "font-sans text-xs pb-4 transition-colors",
                  tab === activeTab
                    ? "border-b-2 border-accent text-accent font-medium"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Unlinked Audio Tab */}
        {activeTab === "Unlinked Audio" ? (
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Title</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Type</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Language</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unlinked.map((item) => (
                <tr key={`${item.id}-${item.locale}`} className="border-b border-border">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">{item.title}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full", typeBadgeColors[item.contentType])}>
                      {item.contentType}
                    </span>
                  </td>
                  <td className="font-mono text-[11px] text-text-muted px-4 py-3.5 uppercase">{item.locale}</td>
                  <td className="px-4 py-3.5 flex items-center gap-3">
                    <button
                      onClick={() => handlePlay(item.audioUrl)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent hover:text-text-primary transition-colors"
                    >
                      {playingUrl === item.audioUrl ? <Pause size={12} /> : <Play size={12} />}
                      {playingUrl === item.audioUrl ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={() => handleDownload(item.audioUrl, `${item.slug}-${item.locale}`)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent hover:text-text-primary transition-colors"
                    >
                      <Download size={12} />Download
                    </button>
                    <button
                      onClick={() => handleImport(item)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-[#6BBF7B] hover:text-text-primary transition-colors"
                    >
                      <Import size={12} />Import
                    </button>
                  </td>
                </tr>
              ))}
              {unlinked.length === 0 && (
                <tr><td colSpan={4} className="text-center font-sans text-sm text-text-muted py-8">No unlinked audio found.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          /* Episodes Table */
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Title</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Source</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Duration</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Date</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getRows().map((ep) => (
                <tr key={ep.id} className="border-b border-border">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">{ep.title}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                      typeBadgeColors[ep.contentType || "standalone"]
                    )}>
                      {ep.contentType || "Standalone"}
                    </span>
                  </td>
                  <td className="font-mono text-[11px] text-text-muted px-4 py-3.5">{ep.duration || "—"}</td>
                  <td className="font-mono text-[10px] text-text-muted px-4 py-3.5">
                    {ep.publishedAt ? new Date(ep.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3.5 flex items-center gap-3">
                    <button
                      onClick={() => handlePlay(ep.audioUrl)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent hover:text-text-primary transition-colors"
                    >
                      {playingUrl === ep.audioUrl ? <Pause size={12} /> : <Play size={12} />}
                      {playingUrl === ep.audioUrl ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={() => handleDownload(ep.audioUrl, ep.slug)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent hover:text-text-primary transition-colors"
                    >
                      <Download size={12} />Download
                    </button>
                    <button
                      onClick={() => handleDelete(ep)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />Delete
                    </button>
                  </td>
                </tr>
              ))}
              {getRows().length === 0 && (
                <tr><td colSpan={5} className="text-center font-sans text-sm text-text-muted py-8">No episodes found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New Episode Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl text-text-primary">New Standalone Episode</h2>
              <button onClick={() => setShowNewModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <form action={createAction} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-1.5">Title</label>
                <input
                  name="title"
                  required
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-1.5">Audio URL</label>
                <input
                  name="audioUrl"
                  required
                  placeholder="Upload via Media Library, then paste URL"
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-1.5">Duration</label>
                  <input
                    name="duration"
                    placeholder="e.g. 12:34"
                    className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase mb-1.5">Cover Image URL</label>
                  <input
                    name="coverImage"
                    className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {createState?.error && (
                <p className="font-sans text-sm text-red-400">{createState.error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="font-sans text-sm text-text-muted hover:text-text-primary px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
                >
                  <Mic size={14} />
                  Create Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
