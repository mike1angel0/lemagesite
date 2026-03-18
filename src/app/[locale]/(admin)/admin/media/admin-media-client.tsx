"use client";

import { useState, useRef, useActionState, useEffect, useCallback } from "react";
import { Plus, Trash2, ImageIcon, FileText, Music, Film, X, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMediaFileAction, deleteMediaAction } from "@/lib/actions/media";
import type { AuthState } from "@/lib/actions/auth";

const filterTabs = ["All Files", "Images", "Audio", "Documents", "Video"];
const typeFilter: Record<string, string> = {
  Images: "image",
  Audio: "audio",
  Documents: "document",
  Video: "video",
};

const typeIcons: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  audio: Music,
  document: FileText,
  video: Film,
};

/** Normalize type — handles both short ("image") and MIME ("image/png") formats */
function getCategory(type: string): string {
  if (type.startsWith("image")) return "image";
  if (type.startsWith("audio")) return "audio";
  if (type.startsWith("video")) return "video";
  return type;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaRow {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export function AdminMediaClient({ files: initialFiles }: { files: MediaRow[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [activeTab, setActiveTab] = useState("All Files");
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaRow | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closePreview = useCallback(() => { setPreviewFile(null); setCopied(false); }, []);

  useEffect(() => {
    if (!previewFile) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closePreview(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewFile, closePreview]);

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const [, createAction] = useActionState(createMediaFileAction, {} as AuthState);
  const [, deleteAction] = useActionState(deleteMediaAction, {} as AuthState);

  const filtered = files.filter((f) => {
    if (activeTab === "All Files") return true;
    return getCategory(f.type) === typeFilter[activeTab];
  });

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const type = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) ? "image"
        : ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext) ? "audio"
        : ["mp4", "webm", "mov", "avi"].includes(ext) ? "video"
        : "document";

      const fd = new FormData();
      fd.set("name", file.name);
      fd.set("url", data.secure_url);
      fd.set("type", type);
      fd.set("size", String(file.size));
      fd.set("cloudinaryId", data.public_id || "");
      createAction(fd);

      setFiles((prev) => [{
        id: Date.now().toString(),
        name: file.name,
        url: data.secure_url,
        type,
        size: file.size,
        createdAt: new Date().toISOString(),
      }, ...prev]);
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(file: MediaRow) {
    if (!confirm(`Delete "${file.name}"?`)) return;
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    const fd = new FormData();
    fd.set("id", file.id);
    deleteAction(fd);
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">Media Library</h1>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "New Upload"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-8 mt-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3.5 py-1.5 font-sans text-[12px] transition-colors",
              activeTab === tab ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Info Row */}
      <div className="px-8 mt-4">
        <p className="font-sans text-[12px] text-text-muted">
          {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(files.reduce((sum, f) => sum + f.size, 0))} used
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-4 gap-4 px-8 mt-4 pb-8">
        {filtered.map((file) => {
          const cat = getCategory(file.type);
          const Icon = typeIcons[cat] || FileText;
          return (
            <div key={file.id} className="rounded-lg border border-border overflow-hidden hover:border-accent-dim transition-colors group">
              <div
                className="h-[140px] bg-bg-elevated flex items-center justify-center rounded-t relative cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                {cat === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <Icon className="h-8 w-8 text-text-muted" />
                )}
                <button
                  onClick={() => handleDelete(file)}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="p-3 bg-bg-card">
                <p className="font-sans text-[12px] text-text-primary truncate">{file.name}</p>
                <p className="font-mono text-[10px] text-text-muted mt-0.5">{formatSize(file.size)}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-4 flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-10 w-10 text-text-muted mb-4" />
            <p className="font-sans text-sm text-text-muted">No files found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute -top-2 -right-2 z-10 rounded-full bg-bg-card border border-border p-1.5 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>

            {/* Image preview */}
            {getCategory(previewFile.type) === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-[85vw] max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <div className="w-[400px] h-[300px] bg-bg-elevated rounded-lg flex items-center justify-center">
                {(() => { const PIcon = typeIcons[getCategory(previewFile.type)] || FileText; return <PIcon className="h-16 w-16 text-text-muted" />; })()}
              </div>
            )}

            {/* Info bar */}
            <div className="flex items-center gap-3 bg-bg-card border border-border rounded-lg px-4 py-2.5">
              <p className="font-sans text-[12px] text-text-primary truncate max-w-[300px]">{previewFile.name}</p>
              <span className="font-mono text-[10px] text-text-muted">{formatSize(previewFile.size)}</span>
              <button
                onClick={() => copyUrl(previewFile.url)}
                className="inline-flex items-center gap-1 font-sans text-[11px] text-accent hover:text-text-primary transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy URL"}
              </button>
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-sans text-[11px] text-accent hover:text-text-primary transition-colors"
              >
                <ExternalLink size={12} />
                Open
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
