"use client";

import { useState, useEffect, useActionState } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  ExternalLink,
  Check,
  X,
  Pencil,
  Zap,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  captureSourceAction,
  deleteSourceAction,
  approveRepostAction,
  skipRepostAction,
  editRepostAction,
  approveAllDraftsAction,
} from "@/lib/actions/social";
import type { AuthState } from "@/lib/actions/auth";

const tabs = ["Sources", "Queue", "Posted", "Settings"];

interface SourceRow {
  id: string;
  url: string;
  content: string | null;
  contentType: string | null;
  platform: string | null;
  status: string;
  capturedVia: string | null;
  createdAt: string;
}

interface RepostRow {
  id: string;
  sourceId: string;
  sourceUrl: string;
  platform: string;
  generatedText: string;
  editedText: string | null;
  status: string;
  platformPostId: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface BatchRow {
  id: string;
  batchSize: number;
  contentType: string | null;
  status: string;
  createdAt: string;
}

interface Summary {
  totalSources: number;
  pendingSources: number;
  draftReposts: number;
  approvedReposts: number;
  postedReposts: number;
  connectedAccounts: number;
}

const statusBadgeColors: Record<string, string> = {
  PENDING: "bg-gold/10 text-gold",
  READY: "bg-accent/10 text-accent",
  ARCHIVED: "bg-text-muted/10 text-text-muted",
  DRAFT: "bg-gold/10 text-gold",
  APPROVED: "bg-accent/10 text-accent",
  POSTED: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  SKIPPED: "bg-text-muted/10 text-text-muted",
  FAILED: "bg-red-500/10 text-red-400",
  PROCESSING: "bg-accent/10 text-accent",
  COMPLETED: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
};

const platformIcons: Record<string, string> = {
  TWITTER: "𝕏",
  FACEBOOK: "f",
  LINKEDIN: "in",
  INSTAGRAM: "📷",
  TIKTOK: "♪",
};

const CONTENT_TYPES = ["POEM", "PHOTO", "ESSAY", "RESEARCH", "BOOK", "EVENT"];

function isTwitterUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname === "x.com" || hostname === "twitter.com";
  } catch { return false; }
}

function isFacebookUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname === "facebook.com" || hostname === "fb.com" || hostname.endsWith(".facebook.com");
  } catch { return false; }
}

function getPlatformComposeUrl(platform: string, text: string, sourceUrl?: string): string {
  const encodedText = encodeURIComponent(text);
  switch (platform) {
    case "TWITTER": {
      if (sourceUrl && isTwitterUrl(sourceUrl)) {
        // Quote tweet: embeds the original tweet with commentary
        return `https://x.com/intent/tweet?url=${encodeURIComponent(sourceUrl)}&text=${encodedText}`;
      }
      const fullText = sourceUrl ? `${text}\n\n${sourceUrl}` : text;
      return `https://x.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    }
    case "FACEBOOK":
      // sharer.php works for any URL including FB post URLs — opens share dialog
      return sourceUrl
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sourceUrl)}`
        : "";
    case "LINKEDIN":
      // LinkedIn repost with comment — shareArticle lets you add commentary
      return sourceUrl
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sourceUrl)}`
        : `https://www.linkedin.com/feed/?shareActive=true`;
    case "INSTAGRAM":
      // Open original post for user to comment — text copied to clipboard
      return sourceUrl || "";
    case "TIKTOK":
      // Open original post for user to comment — text copied to clipboard
      return sourceUrl || "";
    default:
      return "";
  }
}

export function AdminSocialClient({
  sources: initialSources,
  reposts: initialReposts,
  batches,
  summary,
}: {
  sources: SourceRow[];
  reposts: RepostRow[];
  accounts: { id: string; platform: string; accountName: string; expiresAt: string | null }[];
  batches: BatchRow[];
  summary: Summary;
}) {
  const [activeTab, setActiveTab] = useState("Sources");
  const [sources, setSources] = useState(initialSources);
  const [reposts, setReposts] = useState(initialReposts);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [editingRepost, setEditingRepost] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [batchSize, setBatchSize] = useState(50);
  const [batchContentType, setBatchContentType] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Auto-capture from share target (Android/iOS share sheet)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareUrl = params.get("share_url");
    if (shareUrl) {
      const shareContent = params.get("share_content") || "";
      const fd = new FormData();
      fd.set("url", shareUrl);
      if (shareContent) fd.set("content", shareContent);
      captureAction(fd);
      setSources((prev) => [
        {
          id: `temp-${Date.now()}`,
          url: shareUrl,
          content: shareContent || null,
          contentType: null,
          platform: null,
          status: "PENDING",
          capturedVia: "share-target",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      // Clean URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [, captureAction] = useActionState(captureSourceAction, {} as AuthState);
  const [, deleteAction] = useActionState(deleteSourceAction, {} as AuthState);
  const [, approveAction] = useActionState(approveRepostAction, {} as AuthState);
  const [, skipAction] = useActionState(skipRepostAction, {} as AuthState);
  const [, editAction] = useActionState(editRepostAction, {} as AuthState);
  const [, approveAllAction] = useActionState(approveAllDraftsAction, {} as AuthState);

  const draftReposts = reposts.filter((r) => r.status === "DRAFT");
  const readyReposts = reposts.filter((r) => r.status === "DRAFT" || r.status === "APPROVED");
  const postedReposts = reposts.filter((r) => r.status === "POSTED");

  function handleDeleteSource(source: SourceRow) {
    if (!confirm(`Delete captured source "${source.url}"?`)) return;
    setSources((prev) => prev.filter((s) => s.id !== source.id));
    const fd = new FormData();
    fd.set("id", source.id);
    deleteAction(fd);
  }

  function handleApprove(repost: RepostRow) {
    setReposts((prev) =>
      prev.map((r) => (r.id === repost.id ? { ...r, status: "APPROVED" } : r))
    );
    const fd = new FormData();
    fd.set("id", repost.id);
    approveAction(fd);
  }

  function handleSkip(repost: RepostRow) {
    setReposts((prev) =>
      prev.map((r) => (r.id === repost.id ? { ...r, status: "SKIPPED" } : r))
    );
    const fd = new FormData();
    fd.set("id", repost.id);
    skipAction(fd);
  }

  function handleStartEdit(repost: RepostRow) {
    setEditingRepost(repost.id);
    setEditText(repost.editedText || repost.generatedText);
  }

  function handleSaveEdit(repost: RepostRow) {
    setReposts((prev) =>
      prev.map((r) =>
        r.id === repost.id ? { ...r, editedText: editText } : r
      )
    );
    const fd = new FormData();
    fd.set("id", repost.id);
    fd.set("editedText", editText);
    editAction(fd);
    setEditingRepost(null);
  }

  function handleApproveAll() {
    if (!confirm(`Approve all ${draftReposts.length} draft reposts?`)) return;
    setReposts((prev) =>
      prev.map((r) => (r.status === "DRAFT" ? { ...r, status: "APPROVED" } : r))
    );
    const fd = new FormData();
    approveAllAction(fd);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize,
          contentType: batchContentType || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Generation failed: ${data.error}`);
      } else {
        alert(`Generated ${data.repostsCreated} reposts from ${data.sourcesProcessed} sources`);
        window.location.reload();
      }
    } catch {
      alert("Generation request failed");
    } finally {
      setGenerating(false);
    }
  }

  function handleOpenPlatform(repost: RepostRow) {
    const text = repost.editedText || repost.generatedText;
    const composeUrl = getPlatformComposeUrl(repost.platform, text, repost.sourceUrl);

    // Always copy text to clipboard
    navigator.clipboard.writeText(text);
    setCopiedId(repost.id);
    setTimeout(() => setCopiedId(null), 3000);

    if (!composeUrl) {
      alert(`Text copied to clipboard! Open ${repost.platform} and paste it.`);
      return;
    }

    // Open compose window
    window.open(composeUrl, "_blank");
  }

  function handleMarkPosted(repost: RepostRow) {
    setReposts((prev) =>
      prev.map((r) => (r.id === repost.id ? { ...r, status: "POSTED" } : r))
    );
    // Use approve action to update status — we'll repurpose it
    const fd = new FormData();
    fd.set("id", repost.id);
    // Mark as posted via the approve action endpoint
    fetch("/api/social/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repostIds: [repost.id], markOnly: true }),
    });
  }

  function handleCopyText(repost: RepostRow) {
    const text = repost.editedText || repost.generatedText;
    navigator.clipboard.writeText(text);
    setCopiedId(repost.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleRegenerate(repost: RepostRow) {
    setRegeneratingId(repost.id);
    try {
      const res = await fetch("/api/social/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repostId: repost.id }),
      });
      const data = await res.json();
      if (data.text) {
        setReposts((prev) =>
          prev.map((r) =>
            r.id === repost.id ? { ...r, generatedText: data.text, editedText: null } : r
          )
        );
      } else {
        alert(data.error || "Regeneration failed");
      }
    } catch {
      alert("Regeneration request failed");
    } finally {
      setRegeneratingId(null);
    }
  }

  function handleCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    captureAction(fd);
    const url = fd.get("url") as string;
    setSources((prev) => [
      {
        id: `temp-${Date.now()}`,
        url,
        content: (fd.get("content") as string) || null,
        contentType: (fd.get("contentType") as string) || null,
        platform: null,
        status: "PENDING",
        capturedVia: "admin",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowCaptureModal(false);
  }

  const bookmarkletCode = `javascript:void(fetch('${typeof window !== "undefined" ? window.location.origin : "https://mihaigavrilescu.ro"}/api/social/capture',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':'YOUR_API_KEY'},body:JSON.stringify({url:location.href,content:window.getSelection().toString(),capturedVia:'bookmarklet'})}).then(r=>r.json()).then(d=>alert(d.message||d.error)).catch(()=>alert('Capture failed')))`;

  const stats = [
    { label: "SOURCES", value: String(summary.totalSources) },
    { label: "PENDING", value: String(summary.pendingSources) },
    { label: "IN QUEUE", value: String(summary.draftReposts + summary.approvedReposts) },
    { label: "POSTED", value: String(summary.postedReposts) },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Social Repost</h1>
        <div className="flex gap-3">
          {activeTab === "Queue" && draftReposts.length > 0 && (
            <button
              onClick={handleApproveAll}
              className="px-4 py-2 bg-accent/10 text-accent text-[13px] rounded hover:bg-accent/20 transition"
            >
              Approve All ({draftReposts.length})
            </button>
          )}
          {activeTab === "Sources" && (
            <button
              onClick={() => setShowCaptureModal(true)}
              className="px-4 py-2 bg-accent text-bg-primary text-[13px] rounded hover:bg-accent/90 transition"
            >
              + Capture New
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-8 py-6 border-b border-border">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-[11px] tracking-wider text-text-muted mb-1">{s.label}</p>
            <p className="text-2xl font-serif text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 pt-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-[13px] rounded-t transition",
              activeTab === tab
                ? "bg-bg-elevated text-text-primary border-b-2 border-accent"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Sources Tab */}
        {activeTab === "Sources" && (
          <div className="space-y-3">
            {sources.length === 0 ? (
              <p className="text-text-muted text-sm">No captured sources yet. Click &ldquo;Capture New&rdquo; to get started.</p>
            ) : (
              sources.map((source) => (
                <div key={source.id} className="flex items-start gap-4 p-4 bg-bg-surface border border-border rounded">
                  <div className="flex-1 min-w-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline truncate block"
                    >
                      {source.url}
                      <ExternalLink size={12} className="inline ml-1" />
                    </a>
                    <div className="flex gap-2 mt-1">
                      <span className={cn("px-2 py-0.5 rounded text-[11px]", statusBadgeColors[source.status])}>
                        {source.status}
                      </span>
                      {source.contentType && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-bg-elevated text-text-secondary">
                          {source.contentType}
                        </span>
                      )}
                      {source.capturedVia && (
                        <span className="text-[11px] text-text-muted">
                          via {source.capturedVia}
                        </span>
                      )}
                    </div>
                    {source.content && (
                      <p className="text-xs text-text-muted mt-2 line-clamp-2">{source.content}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSource(source)}
                    className="text-text-muted hover:text-red-400 transition shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === "Queue" && (
          <div className="space-y-6">
            {/* Generate controls */}
            <div className="flex items-end gap-4 p-4 bg-bg-surface border border-border rounded">
              <div className="flex-1">
                <label className="text-[11px] tracking-wider text-text-muted block mb-1">CONTENT TYPE FILTER</label>
                <select
                  value={batchContentType}
                  onChange={(e) => setBatchContentType(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary"
                >
                  <option value="">All types</option>
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-wider text-text-muted block mb-1">BATCH SIZE</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-24 bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 bg-accent text-bg-primary text-[13px] rounded hover:bg-accent/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Zap size={14} />
                {generating ? "Generating..." : "Generate Batch"}
              </button>
            </div>

            {/* Reposts in queue */}
            {readyReposts.length === 0 ? (
              <p className="text-text-muted text-sm">No reposts in queue. Generate a batch from pending sources.</p>
            ) : (
              readyReposts.map((repost) => (
                <div key={repost.id} className="p-4 bg-bg-surface border border-border rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" title={repost.platform}>
                      {platformIcons[repost.platform] || repost.platform}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[11px]", statusBadgeColors[repost.status])}>
                      {repost.status}
                    </span>
                    <a
                      href={repost.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-accent truncate"
                    >
                      {repost.sourceUrl}
                    </a>
                  </div>

                  {editingRepost === repost.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(repost)}
                          className="px-3 py-1 bg-accent text-bg-primary text-[12px] rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRepost(null)}
                          className="px-3 py-1 text-text-muted text-[12px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">
                      {repost.editedText || repost.generatedText}
                    </p>
                  )}

                  {editingRepost !== repost.id && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {/* Post to platform button */}
                      <button
                        onClick={() => handleOpenPlatform(repost)}
                        className="px-3 py-1 bg-[#6BBF7B]/10 text-[#6BBF7B] text-[12px] rounded hover:bg-[#6BBF7B]/20 transition flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        {copiedId === repost.id
                          ? "Copied! Paste it"
                          : repost.platform === "TWITTER"
                            ? "Quote Tweet 𝕏"
                            : repost.platform === "FACEBOOK"
                              ? "Share on f"
                              : repost.platform === "LINKEDIN"
                                ? "Repost on in"
                                : repost.platform === "INSTAGRAM"
                                  ? "Comment on 📷"
                                  : repost.platform === "TIKTOK"
                                    ? "Comment on ♪"
                                    : `Post on ${platformIcons[repost.platform]}`}
                      </button>
                      {/* Copy text */}
                      <button
                        onClick={() => handleCopyText(repost)}
                        className="px-3 py-1 bg-bg-elevated text-text-secondary text-[12px] rounded hover:bg-bg-elevated/80 transition flex items-center gap-1"
                      >
                        <Copy size={12} />
                        {copiedId === repost.id ? "Copied!" : "Copy"}
                      </button>
                      {/* Regenerate */}
                      <button
                        onClick={() => handleRegenerate(repost)}
                        disabled={regeneratingId === repost.id}
                        className="px-3 py-1 bg-gold/10 text-gold text-[12px] rounded hover:bg-gold/20 transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={regeneratingId === repost.id ? "animate-spin" : ""} />
                        {regeneratingId === repost.id ? "..." : "Regen"}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(repost)}
                        className="px-3 py-1 bg-accent/10 text-accent text-[12px] rounded hover:bg-accent/20 transition flex items-center gap-1"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      {/* Mark as posted */}
                      <button
                        onClick={() => handleMarkPosted(repost)}
                        className="px-3 py-1 bg-accent/10 text-accent text-[12px] rounded hover:bg-accent/20 transition flex items-center gap-1"
                      >
                        <Check size={12} /> Mark Posted
                      </button>
                      {/* Skip */}
                      <button
                        onClick={() => handleSkip(repost)}
                        className="px-3 py-1 bg-text-muted/10 text-text-muted text-[12px] rounded hover:bg-text-muted/20 transition flex items-center gap-1"
                      >
                        <X size={12} /> Skip
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Posted Tab */}
        {activeTab === "Posted" && (
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {["TWITTER", "FACEBOOK", "LINKEDIN", "INSTAGRAM", "TIKTOK"].map((p) => {
                const count = postedReposts.filter((r) => r.platform === p).length;
                return (
                  <div key={p} className="text-center p-3 bg-bg-surface border border-border rounded">
                    <p className="text-lg mb-1">{platformIcons[p]}</p>
                    <p className="text-xl font-serif text-text-primary">{count}</p>
                    <p className="text-[10px] text-text-muted">{p}</p>
                  </div>
                );
              })}
            </div>

            {postedReposts.length === 0 ? (
              <p className="text-text-muted text-sm">No posts yet.</p>
            ) : (
              postedReposts.map((repost) => (
                <div key={repost.id} className="flex items-start gap-4 p-4 bg-bg-surface border border-border rounded">
                  <span className="text-lg shrink-0">{platformIcons[repost.platform]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {repost.editedText || repost.generatedText}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={cn("px-2 py-0.5 rounded text-[11px]", statusBadgeColors.POSTED)}>
                        POSTED
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {new Date(repost.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "Settings" && (
          <div className="space-y-8">
            {/* How it works */}
            <div>
              <h2 className="text-sm font-medium text-text-primary mb-2">How It Works</h2>
              <div className="p-4 bg-bg-surface border border-border rounded text-xs text-text-secondary space-y-1">
                <p>1. <strong>Capture</strong> URLs from the Sources tab</p>
                <p>2. <strong>Generate</strong> platform-specific text with AI in the Queue tab</p>
                <p>3. <strong>Edit</strong> the generated text if needed</p>
                <p>4. Click <strong>Post on 𝕏</strong> (or other platform) — opens a new tab with text pre-filled</p>
                <p>5. Post it on the platform, then click <strong>Mark Posted</strong> to track it</p>
              </div>
            </div>

            {/* Bookmarklet */}
            <div>
              <h2 className="text-sm font-medium text-text-primary mb-2">Bookmarklet</h2>
              <p className="text-xs text-text-muted mb-3">
                Drag this to your bookmarks bar to quickly capture URLs. Replace YOUR_API_KEY with your capture key.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded text-[11px] text-text-secondary truncate">
                  {bookmarkletCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(bookmarkletCode);
                    alert("Bookmarklet copied!");
                  }}
                  className="px-3 py-2 bg-bg-elevated border border-border rounded hover:bg-bg-surface transition"
                >
                  <Copy size={14} className="text-text-muted" />
                </button>
              </div>
            </div>

            {/* iOS Shortcut Instructions */}
            <div>
              <h2 className="text-sm font-medium text-text-primary mb-2">iOS Shortcut</h2>
              <div className="p-4 bg-bg-surface border border-border rounded text-xs text-text-secondary space-y-2">
                <p>1. Open the Shortcuts app on your iPhone/iPad</p>
                <p>2. Create a new shortcut with these actions:</p>
                <p className="pl-4">a. <strong>Receive</strong> input from Share Sheet (URLs)</p>
                <p className="pl-4">b. <strong>Get Contents of URL</strong>:</p>
                <p className="pl-8">URL: {typeof window !== "undefined" ? window.location.origin : "https://mihaigavrilescu.ro"}/api/social/capture</p>
                <p className="pl-8">Method: POST</p>
                <p className="pl-8">Headers: x-api-key = YOUR_API_KEY, Content-Type = application/json</p>
                <p className="pl-8">Body: {`{"url": "Shortcut Input", "capturedVia": "ios-shortcut"}`}</p>
                <p className="pl-4">c. <strong>Show Notification</strong>: &ldquo;Captured!&rdquo;</p>
                <p>3. Name it &ldquo;Capture to Selenarium&rdquo; and enable &ldquo;Show in Share Sheet&rdquo;</p>
              </div>
            </div>

            {/* Recent Batches */}
            <div>
              <h2 className="text-sm font-medium text-text-primary mb-4">Recent Batches</h2>
              {batches.length === 0 ? (
                <p className="text-text-muted text-sm">No batches yet.</p>
              ) : (
                <div className="space-y-2">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-bg-surface border border-border rounded">
                      <div className="flex items-center gap-3">
                        <span className={cn("px-2 py-0.5 rounded text-[11px]", statusBadgeColors[batch.status])}>
                          {batch.status}
                        </span>
                        <span className="text-xs text-text-secondary">
                          Size: {batch.batchSize}
                          {batch.contentType && ` · ${batch.contentType}`}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Capture Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-primary border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="font-serif text-lg text-text-primary mb-4">Capture URL</h2>
            <form onSubmit={handleCapture} className="space-y-4">
              <div>
                <label className="text-[11px] tracking-wider text-text-muted block mb-1">URL</label>
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full bg-bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-wider text-text-muted block mb-1">POST CONTENT</label>
                <textarea
                  name="content"
                  rows={3}
                  placeholder="Paste the original post text here — AI uses this to generate relevant commentary"
                  className="w-full bg-bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary resize-none"
                />
                <p className="text-[10px] text-text-muted mt-1">Important for social media URLs — AI can&apos;t read the post without this.</p>
              </div>
              <div>
                <label className="text-[11px] tracking-wider text-text-muted block mb-1">CONTENT TYPE</label>
                <select
                  name="contentType"
                  className="w-full bg-bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary"
                >
                  <option value="">Auto-detect</option>
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCaptureModal(false)}
                  className="px-4 py-2 text-text-muted text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-bg-primary text-[13px] rounded hover:bg-accent/90 transition"
                >
                  Capture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
