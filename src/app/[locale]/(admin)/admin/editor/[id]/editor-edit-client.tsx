"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
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
  Sparkles,
  Eye,
  PenLine,
  Heading2,
} from "lucide-react";
import { updateContentAction } from "@/lib/actions/content";
import type { AuthState } from "@/lib/actions/auth";

type Status = "idle" | "saving" | "saved" | "error";

const tierMap: Record<string, string> = {
  FREE: "Free",
  SUPPORTER: "Supporter",
  PATRON: "Patron",
  INNER_CIRCLE: "Inner Circle",
};

const categoryMap: Record<string, string> = {
  Poem: "Poetry",
  Essay: "Essay",
  Research: "Research",
  Photo: "Photography",
};

interface ContentData {
  id: string;
  contentType: string;
  title: string;
  body: string;
  accessTier: string;
  publishedAt: string | null;
  collection?: string;
  category?: string;
  abstract?: string;
  doi?: string;
  pdfUrl?: string;
  imageUrl?: string;
  thumbnail?: string;
  coverImage?: string;
  readTime?: number;
  essayCategory?: string;
  [key: string]: unknown;
}

export function EditorEditClient({ content }: { content: ContentData }) {
  const router = useRouter();
  const category = categoryMap[content.contentType] || content.contentType;

  const [title, setTitle] = useState(content.title);
  const [body, setBody] = useState(content.body || "");
  const [tier, setTier] = useState(tierMap[content.accessTier] || "Free");
  const [tags, setTags] = useState(content.collection || content.category || "");
  const [abstract, setAbstract] = useState(content.abstract || "");
  const [doi, setDoi] = useState(content.doi || "");
  const [pdfUrl, setPdfUrl] = useState(content.pdfUrl || "");
  const [readTime, setReadTime] = useState(content.readTime?.toString() || "");
  const [essayCategory, setEssayCategory] = useState(content.essayCategory || content.category || "");
  const [imageUrl, setImageUrl] = useState(content.imageUrl || "");
  const [featuredImage, setFeaturedImage] = useState(content.thumbnail || content.coverImage || "");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [summarizing, setSummarizing] = useState(false);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.secure_url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const defaultPrompts: Record<string, string> = {
    Poetry: `Minimalist ink and watercolor illustration for "{TITLE}". {SUMMARY}. Sparse, elegant drawing with selective washes of color. An abstract, metaphoric human silhouette — faceless, dissolving into the scene, merging with nature or emotion. Not a realistic person, more a poetic suggestion of one. Limited palette: deep navy (#0B0E13) ink, warm gold (#C9A962) and honey amber (#C8944A) washes, steel blue (#A8B4C8) accents, warm ivory (#F5EED8) negative space. Lots of breathing room. No text, no watermarks, no color swatches. Fill entire frame.`,
    Essay: `Minimalist editorial illustration for "{TITLE}". {SUMMARY}. Clean ink drawing with subtle watercolor accents. An abstract human silhouette or symbolic figure — not a detailed face, more a metaphoric presence within the composition. Limited palette: deep navy (#0B0E13) ink, warm gold (#C9A962) and honey amber (#C8944A) accents, steel blue (#A8B4C8) washes, warm ivory (#F5EED8) background. Thoughtful, refined, minimal. No text, no watermarks, no color swatches. Fill entire frame.`,
    Research: `Minimalist conceptual illustration for "{TITLE}". {SUMMARY}. Precise ink lines with restrained watercolor highlights. An abstract human form — a silhouette or gestural shape suggesting a person, not a portrait. Limited palette: deep navy (#0B0E13) lines, warm gold (#C9A962) accents, steel blue (#A8B4C8) tones, ivory (#F5EED8) space. Sophisticated, sparse, poetic. No text, no watermarks, no color swatches. Fill entire frame.`,
  };

  async function openPromptEditor() {
    const template = defaultPrompts[category] || defaultPrompts.Essay;
    const contentTypeMap: Record<string, string> = { Poetry: "poem", Essay: "essay", Research: "research paper" };

    setImagePrompt(template.replace("{TITLE}", title || "Untitled").replace("{SUMMARY}", "Summarizing..."));
    setShowPromptEditor(true);

    if (!body?.trim()) {
      setImagePrompt(template.replace("{TITLE}", title || "Untitled").replace("{SUMMARY}", title));
      return;
    }

    setSummarizing(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: body, contentType: contentTypeMap[category] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImagePrompt(template.replace("{TITLE}", title || "Untitled").replace("{SUMMARY}", data.summary));
    } catch {
      setImagePrompt(template.replace("{TITLE}", title || "Untitled").replace("{SUMMARY}", title));
    } finally {
      setSummarizing(false);
    }
  }

  async function handleGenerateImage() {
    setShowPromptEditor(false);
    setGenerating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFeaturedImage(data.url);
    } catch {
      setErrorMsg("Image generation failed. Please try again.");
      setStatus("error");
    } finally {
      setGenerating(false);
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
    formData.set("id", content.id);
    formData.set("contentType", content.contentType);
    formData.set("title", title);
    formData.set("body", body);
    formData.set("tier", tier);
    formData.set("tags", tags);
    formData.set("publish", String(publish));

    if (content.contentType === "Poem") {
      if (featuredImage) formData.set("coverImage", featuredImage);
    } else if (content.contentType === "Research") {
      formData.set("abstract", abstract);
      formData.set("doi", doi);
      formData.set("pdfUrl", pdfUrl);
      if (featuredImage) formData.set("coverImage", featuredImage);
    } else if (content.contentType === "Essay") {
      formData.set("readTime", readTime);
      formData.set("essayCategory", essayCategory);
      if (featuredImage) formData.set("thumbnail", featuredImage);
    } else if (content.contentType === "Photo") {
      formData.set("imageUrl", imageUrl || featuredImage);
    }

    const result = await updateContentAction({} as AuthState, formData);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    if (publish) {
      router.push("/admin/content");
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  const toolbarActions = [
    { icon: Heading2, label: "Heading", action: () => insertMarkdown("## ") },
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
          <h1 className="font-sans text-[18px] font-semibold text-text-primary">
            Edit {content.contentType}
          </h1>
          <span className={`rounded px-2 py-0.5 font-mono text-[10px] tracking-[1px] inline-flex items-center gap-1 ${
            status === "saving" ? "bg-[#2A1A0D] text-gold" :
            status === "saved" ? "bg-[#0D2818] text-[#6BBF7B]" :
            status === "error" ? "bg-red-400/10 text-red-400" :
            content.publishedAt ? "bg-[#0D2818] text-[#6BBF7B]" : "bg-[#2A1A0D] text-gold"
          }`}>
            {status === "saving" ? "Saving..." : status === "saved" ? <><Check size={10} /> Saved</> : status === "error" ? "Error" : content.publishedAt ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSubmit(false)} disabled={isBusy || !title.trim()} className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors">
            Save
          </button>
          <button onClick={() => handleSubmit(true)} disabled={isBusy || !title.trim()} className="bg-gold rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors">
            {content.publishedAt ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      {errorMsg && <div className="mx-8 mt-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{errorMsg}</div>}

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Editor */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif text-2xl text-text-primary border-b border-border pb-4 bg-transparent w-full focus:outline-none placeholder:text-text-muted"
          />

          {content.contentType === "Research" && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Abstract</label>
              <textarea placeholder="Paper abstract..." value={abstract} onChange={(e) => setAbstract(e.target.value)} className="w-full bg-bg-card border border-border rounded p-4 font-sans text-sm leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y min-h-[120px]" />
            </div>
          )}

          {/* Toolbar + Write/Preview toggle */}
          <div className="flex items-center gap-1 bg-bg-card rounded border border-border px-2 py-1.5">
            {toolbarActions.map(({ icon: Icon, label, action }) => (
              <button key={label} title={label} onClick={() => { setEditorMode("write"); action(); }} className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Icon size={16} />
              </button>
            ))}
            <div className="ml-auto flex items-center border-l border-border pl-2 gap-1">
              <button
                title="Write"
                onClick={() => setEditorMode("write")}
                className={`p-1.5 rounded transition-colors ${editorMode === "write" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"}`}
              >
                <PenLine size={16} />
              </button>
              <button
                title="Preview"
                onClick={() => setEditorMode("preview")}
                className={`p-1.5 rounded transition-colors ${editorMode === "preview" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"}`}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          {editorMode === "write" ? (
            <textarea
              id="editor-body"
              placeholder="Begin writing... Use ## for chapter headings, **bold**, *italic*"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full font-mono text-sm leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y"
            />
          ) : (
            <div className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full overflow-y-auto">
              {body ? (
                <Markdown
                  components={{
                    h1: ({ children }) => <h1 className="font-serif text-3xl font-semibold text-text-primary mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="font-serif text-2xl font-semibold text-text-primary mt-8 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-serif text-xl font-semibold text-text-primary mt-6 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="font-sans text-base text-text-secondary leading-[1.8] mb-4">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                    em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-4 my-4 italic text-text-muted">{children}</blockquote>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-text-secondary space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-text-secondary space-y-1">{children}</ol>,
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      return isBlock
                        ? <pre className="bg-bg-elevated rounded p-4 my-4 overflow-x-auto"><code className="font-mono text-sm text-text-secondary">{children}</code></pre>
                        : <code className="font-mono text-sm bg-bg-elevated rounded px-1.5 py-0.5 text-accent">{children}</code>;
                    },
                    a: ({ children, href }) => <a href={href} className="text-accent underline hover:text-text-primary transition-colors">{children}</a>,
                    hr: () => <hr className="border-border my-8" />,
                    img: ({ src, alt }) => <img src={src} alt={alt ?? ""} className="rounded max-w-full my-4" />,
                  }}
                >
                  {body}
                </Markdown>
              ) : (
                <p className="font-sans text-base text-text-muted">Nothing to preview yet...</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="w-[320px] bg-bg-surface border-l border-border p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Category</label>
            <div className="w-full border border-border bg-bg-elevated rounded py-2.5 px-3 text-text-primary font-sans text-sm">{content.contentType}</div>
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
          {content.contentType === "Research" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">DOI</label>
                  <input type="text" placeholder="10.xxxx/xxxxx" value={doi} onChange={(e) => setDoi(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
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
                    <button type="button" onClick={() => pdfInputRef.current?.click()} disabled={uploadingPdf} className="w-full h-[40px] border border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-accent-dim transition-colors">
                      {uploadingPdf ? <span className="font-sans text-xs text-text-muted">Uploading...</span> : <><Upload size={14} className="text-text-muted" /><span className="font-sans text-xs text-text-muted ml-1">Upload</span></>}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Essay-specific */}
          {content.contentType === "Essay" && (
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

          {/* Photography-specific */}
          {content.contentType === "Photo" && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Photo URL</label>
              <input type="url" placeholder="https://res.cloudinary.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
            </div>
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
            {["Poetry", "Essay", "Research"].includes(category) && !featuredImage && (
              <button
                type="button"
                onClick={generating ? undefined : openPromptEditor}
                disabled={generating || (!title.trim() && !body.trim())}
                className="w-full h-[40px] mt-2 border border-dashed border-accent-dim rounded flex items-center justify-center gap-2 cursor-pointer hover:bg-accent/10 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <span className="font-sans text-xs text-accent">Generating...</span>
                ) : (
                  <>
                    <Sparkles size={14} className="text-accent" />
                    <span className="font-sans text-xs text-accent">Generate with AI</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-bg-card border border-border rounded-lg w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-semibold text-text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                Image Generation Prompt
              </h2>
              <button onClick={() => setShowPromptEditor(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="font-sans text-xs text-text-muted">
              {summarizing ? "Summarizing your content with AI..." : "Edit the prompt below to control what image DALL-E generates."}
            </p>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              disabled={summarizing}
              rows={8}
              className="w-full bg-bg-surface border border-border rounded p-4 font-sans text-sm leading-relaxed text-text-secondary focus:outline-none focus:border-accent-dim resize-y disabled:opacity-50"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPromptEditor(false)}
                className="font-sans text-sm text-text-muted hover:text-text-primary px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || summarizing}
                className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Sparkles size={14} />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
