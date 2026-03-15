"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  Quote,
  Code,
  ImageIcon,
  Check,
  Upload,
  X,
} from "lucide-react";
import {
  savePoemAction,
  saveResearchAction,
  savePhotoAction,
  saveEssayAction,
  saveAlbumAction,
} from "@/lib/actions/content";
import type { AuthState } from "@/lib/actions/auth";

type Status = "draft" | "saving" | "saved" | "error";

const typeToCategory: Record<string, string> = {
  Poem: "Poetry",
  Photo: "Photography",
  Essay: "Essay",
  Research: "Research",
};

export default function AdminEditorNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(
    (initialType && typeToCategory[initialType]) || "Poetry"
  );
  const [tier, setTier] = useState("Free");
  const [tags, setTags] = useState("");
  const [abstract, setAbstract] = useState("");
  const [doi, setDoi] = useState("");
  const [year, setYear] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [camera, setCamera] = useState("");
  const [location, setLocation] = useState("");
  const [readTime, setReadTime] = useState("");
  const [essayCategory, setEssayCategory] = useState("");
  const [album, setAlbum] = useState("");
  const [duration, setDuration] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [errorMsg, setErrorMsg] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const [featuredImage, setFeaturedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const isBusy = status === "saving";

  async function handleFileUpload(
    file: File,
    setUrl: (url: string) => void,
    setLoading: (v: boolean) => void
  ) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUrl(data.secure_url);
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  function insertMarkdown(prefix: string, suffix: string = "") {
    const textarea = document.querySelector<HTMLTextAreaElement>("#editor-body");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end);
    const newBody = body.substring(0, start) + prefix + selected + suffix + body.substring(end);
    setBody(newBody);
  }

  async function handleSubmit(publish: boolean) {
    if (!title.trim() || isBusy) return;
    setStatus("saving");
    setErrorMsg("");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", body);
    formData.set("tier", tier);
    formData.set("tags", tags);
    formData.set("publish", String(publish));

    let result: AuthState;

    if (category === "Poetry") {
      result = await savePoemAction({} as AuthState, formData);
    } else if (category === "Research") {
      formData.set("abstract", abstract);
      formData.set("doi", doi);
      formData.set("year", year);
      formData.set("pdfUrl", pdfUrl);
      result = await saveResearchAction({} as AuthState, formData);
    } else if (category === "Photography") {
      formData.set("imageUrl", imageUrl || featuredImage);
      result = await savePhotoAction({} as AuthState, formData);
    } else if (category === "Essay") {
      formData.set("readTime", readTime);
      formData.set("essayCategory", essayCategory);
      result = await saveEssayAction({} as AuthState, formData);
    } else if (category === "Music") {
      formData.set("duration", duration);
      result = await saveAlbumAction({} as AuthState, formData);
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("draft"), 2000);
      return;
    }

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    if (publish) {
      router.push("/admin/content");
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("draft"), 2000);
    }
  }

  const toolbarActions = [
    { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: Underline, label: "Underline", action: () => insertMarkdown("<u>", "</u>") },
    { icon: LinkIcon, label: "Link", action: () => insertMarkdown("[", "](url)") },
    { icon: List, label: "List", action: () => insertMarkdown("- ") },
    { icon: Quote, label: "Quote", action: () => insertMarkdown("> ") },
    { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
    { icon: ImageIcon, label: "Image", action: () => insertMarkdown("![alt](", ")") },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-sans text-[18px] font-semibold text-text-primary">New {category}</h1>
          <span className="bg-[#2A1A0D] text-gold rounded px-2 py-0.5 font-mono text-[10px] tracking-[1px] inline-flex items-center gap-1">
            {status === "saving" ? "Saving..." : status === "saved" ? <><Check size={10} /> Saved</> : status === "error" ? "Error" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSubmit(false)} disabled={isBusy || !title.trim()} className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors">Save Draft</button>
          <button onClick={() => handleSubmit(true)} disabled={isBusy || !title.trim()} className="bg-gold rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors">Publish</button>
        </div>
      </div>

      {errorMsg && <div className="mx-8 mt-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{errorMsg}</div>}

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Editor */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          <input
            type="text"
            placeholder={category === "Research" ? "Paper title..." : category === "Photography" ? "Photo title..." : category === "Essay" ? "Essay title..." : category === "Music" ? "Album / Track title..." : "Poem title..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif text-2xl text-text-primary border-b border-border pb-4 bg-transparent w-full focus:outline-none placeholder:text-text-muted"
          />

          {category === "Research" && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Abstract</label>
              <textarea placeholder="Paper abstract..." value={abstract} onChange={(e) => setAbstract(e.target.value)} className="w-full bg-bg-card border border-border rounded p-4 font-sans text-sm leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y min-h-[120px]" />
            </div>
          )}

          {/* Rich text toolbar */}
          <div className="flex items-center gap-1 bg-bg-card rounded border border-border px-2 py-1.5">
            {toolbarActions.map(({ icon: Icon, label, action }) => (
              <button key={label} title={label} onClick={action} className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Icon size={16} />
              </button>
            ))}
          </div>

          <textarea
            id="editor-body"
            placeholder={category === "Research" ? "Full paper body (optional)..." : "Begin writing..."}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full font-serif text-base leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y"
          />
        </div>

        {/* Right: Sidebar */}
        <div className="w-[320px] bg-bg-surface border-l border-border p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim">
              <option>Poetry</option>
              <option>Photography</option>
              <option>Essay</option>
              <option>Music</option>
              <option>Research</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Membership Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim">
              <option>Free</option>
              <option>Supporter</option>
              <option>Patron</option>
              <option>Inner Circle</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Tags</label>
            <input type="text" placeholder="Add tags, separated by commas" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
          </div>

          {/* Research-specific */}
          {category === "Research" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Year</label>
                  <input type="number" placeholder="2026" value={year} onChange={(e) => setYear(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">DOI</label>
                  <input type="text" placeholder="10.xxxx/xxxxx" value={doi} onChange={(e) => setDoi(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">PDF</label>
                <input ref={pdfInputRef} type="file" accept=".pdf" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, setPdfUrl, setUploadingPdf); }} className="hidden" />
                {pdfUrl ? (
                  <div className="flex items-center gap-2 border border-border rounded px-3 py-2">
                    <span className="font-sans text-xs text-accent truncate flex-1">{pdfUrl.split("/").pop()}</span>
                    <button type="button" onClick={() => setPdfUrl("")} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => pdfInputRef.current?.click()} disabled={uploadingPdf} className="w-full h-[60px] border border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-accent-dim transition-colors">
                    {uploadingPdf ? <span className="font-sans text-xs text-text-muted">Uploading...</span> : <><Upload size={14} className="text-text-muted mb-1" /><span className="font-sans text-xs text-text-muted">Upload PDF</span></>}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Photography-specific */}
          {category === "Photography" && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Photo URL</label>
                <input type="url" placeholder="https://res.cloudinary.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Series</label>
                <input type="text" placeholder="e.g. Fog Studies" value={seriesName} onChange={(e) => setSeriesName(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Camera</label>
                  <input type="text" placeholder="e.g. Sony A7III" value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Location</label>
                  <input type="text" placeholder="e.g. Bucharest" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
                </div>
              </div>
            </>
          )}

          {/* Essay-specific */}
          {category === "Essay" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Read Time (min)</label>
                <input type="number" placeholder="e.g. 12" value={readTime} onChange={(e) => setReadTime(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Category</label>
                <input type="text" placeholder="e.g. AI & Philosophy" value={essayCategory} onChange={(e) => setEssayCategory(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
            </div>
          )}

          {/* Music-specific */}
          {category === "Music" && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Album</label>
                <input type="text" placeholder="e.g. Nocturnal Echoes" value={album} onChange={(e) => setAlbum(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Duration</label>
                  <input type="text" placeholder="e.g. 4:32" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Audio URL</label>
                  <input type="url" placeholder="https://..." value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
                </div>
              </div>
            </>
          )}

          {/* Featured Image Upload */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Featured Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, setFeaturedImage, setUploading); }} className="hidden" />
            {featuredImage ? (
              <div className="relative w-full h-[100px] border border-border rounded overflow-hidden group">
                <Image src={featuredImage} alt="Featured" fill className="object-cover" />
                <button type="button" onClick={() => { setFeaturedImage(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-[100px] border border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-accent-dim transition-colors">
                {uploading ? <span className="font-sans text-xs text-text-muted">Uploading...</span> : <><Upload size={16} className="text-text-muted mb-1" /><span className="font-sans text-xs text-text-muted">Click to upload image</span></>}
              </button>
            )}
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted">Schedule Publication</label>
              <button onClick={() => setScheduleEnabled(!scheduleEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${scheduleEnabled ? "bg-accent" : "bg-border"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${scheduleEnabled ? "left-[22px] bg-bg" : "left-0.5 bg-text-muted"}`} />
              </button>
            </div>
            {scheduleEnabled && (
              <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="mt-2 w-full border border-border bg-transparent rounded py-2 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
