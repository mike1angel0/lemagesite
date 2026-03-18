"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Languages,
  ChevronDown,
  ChevronUp,
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
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const [featuredImage, setFeaturedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Tag suggestion state
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Translation state (Poetry only)
  const [language, setLanguage] = useState<"ro" | "en">("ro");
  const [titleTranslation, setTitleTranslation] = useState("");
  const [bodyTranslation, setBodyTranslation] = useState("");
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

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

  const IMAGE_RULES = "CRITICAL RULES: The image MUST fill the ENTIRE canvas edge-to-edge — no borders, margins, or empty space. Do NOT include any text, words, letters, labels, titles, watermarks, or typography. Do NOT show color palettes, swatches, or design reference elements. Output a single cohesive scene only. The scene MUST feature a human figure (man or woman) as the focal point or prominent element — never an empty landscape.";

  const defaultPrompts: Record<string, string> = {
    Poetry: `Evocative, minimal, atmospheric photograph or painting for a poem titled "{TITLE}". Feature a solitary human figure embodying the poem's emotion. Capture the emotional essence: {SUMMARY}. Dark moody tones, cinematic lighting, strong visual metaphor. Think editorial art photography — intimate, haunting, shareable. ${IMAGE_RULES}`,
    Essay: `Bold, minimal editorial illustration for an essay titled "{TITLE}". Feature a human figure in a conceptual scene reflecting the theme. Core theme: {SUMMARY}. Clean composition, dramatic lighting, thought-provoking. Modern magazine cover aesthetic — striking, scroll-stopping. ${IMAGE_RULES}`,
    Research: `Abstract, elegant visualization for a research paper titled "{TITLE}". Include a human figure interacting with or surrounded by the subject matter. Subject: {SUMMARY}. Sophisticated, modern, minimal — like a premium journal cover. Dark palette with selective accent color. ${IMAGE_RULES}`,
  };

  const [summarizing, setSummarizing] = useState(false);

  async function openPromptEditor() {
    const template = defaultPrompts[category] || defaultPrompts.Essay;
    const contentTypeMap: Record<string, string> = { Poetry: "poem", Essay: "essay", Research: "research paper" };

    // Show modal immediately with a loading state
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
      // Fallback: use title only
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

  async function handleSuggestTags() {
    if (!title.trim() && !body.trim()) return;
    setSuggestingTags(true);
    try {
      const res = await fetch("/api/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, category }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestedTags(data.tags || []);
    } catch {
      setErrorMsg("Tag suggestion failed. Please try again.");
      setStatus("error");
    } finally {
      setSuggestingTags(false);
    }
  }

  async function handleTranslate() {
    if (!title.trim() && !body.trim()) return;
    setTranslating(true);
    setShowTranslation(true);
    const targetLang = language === "ro" ? "en" : "ro";
    try {
      const [titleRes, bodyRes] = await Promise.all([
        title.trim()
          ? fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: title, from: language, to: targetLang, field: "title" }),
            }).then((r) => r.json())
          : Promise.resolve({ translation: "" }),
        body.trim()
          ? fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: body, from: language, to: targetLang, field: "body" }),
            }).then((r) => r.json())
          : Promise.resolve({ translation: "" }),
      ]);
      setTitleTranslation(titleRes.translation || "");
      setBodyTranslation(bodyRes.translation || "");
    } catch {
      setErrorMsg("Translation failed. Please try again.");
      setStatus("error");
    } finally {
      setTranslating(false);
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
    if (scheduleEnabled && scheduleDate) {
      formData.set("scheduleDate", scheduleDate);
    }

    let result: AuthState;

    if (category === "Poetry") {
      if (featuredImage) formData.set("coverImage", featuredImage);
      formData.set("language", language);
      if (titleTranslation) formData.set("titleTranslation", titleTranslation);
      if (bodyTranslation) formData.set("bodyTranslation", bodyTranslation);
      result = await savePoemAction({} as AuthState, formData);
    } else if (category === "Research") {
      formData.set("abstract", abstract);
      formData.set("doi", doi);
      formData.set("year", year);
      formData.set("pdfUrl", pdfUrl);
      if (featuredImage) formData.set("coverImage", featuredImage);
      result = await saveResearchAction({} as AuthState, formData);
    } else if (category === "Photography") {
      formData.set("imageUrl", imageUrl || featuredImage);
      result = await savePhotoAction({} as AuthState, formData);
    } else if (category === "Essay") {
      formData.set("readTime", readTime);
      formData.set("essayCategory", essayCategory);
      if (featuredImage) formData.set("thumbnail", featuredImage);
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
              placeholder={category === "Research" ? "Full paper body (optional)...\n\nUse ## for chapter headings" : "Begin writing...\n\nUse ## for chapter headings, **bold**, *italic*"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full font-mono text-sm leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y"
            />
          ) : (
            <div className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full overflow-y-auto prose-editor">
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
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted">Tags</label>
              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={suggestingTags || (!title.trim() && !body.trim())}
                className="flex items-center gap-1 font-sans text-[10px] text-accent hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <Sparkles size={10} />
                {suggestingTags ? "Suggesting..." : "AI Suggest"}
              </button>
            </div>
            <input type="text" placeholder="Add tags, separated by commas" value={tags} onChange={(e) => { setTags(e.target.value); setSuggestedTags([]); }} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestedTags.map((tag) => {
                  const currentTags = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
                  const isSelected = currentTags.includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTags(currentTags.filter((t) => t !== tag.toLowerCase()).join(", "));
                        } else {
                          setTags(tags ? `${tags}, ${tag}` : tag);
                        }
                      }}
                      className={`font-mono text-[9px] uppercase tracking-[1px] rounded-full px-2.5 py-1 transition-colors ${
                        isSelected
                          ? "bg-accent text-bg"
                          : "bg-bg-card border border-border text-text-muted hover:text-text-primary hover:border-accent-dim"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Poetry: Language & Translation */}
          {category === "Poetry" && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">Original Language</label>
                <div className="flex gap-2">
                  {(["ro", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-2 rounded font-mono text-xs uppercase tracking-[1px] transition-colors ${
                        language === lang
                          ? "bg-accent text-bg font-medium"
                          : "bg-bg-card border border-border text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {lang === "ro" ? "Romana" : "English"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating || (!title.trim() && !body.trim())}
                className="w-full h-[40px] border border-dashed border-accent-dim rounded flex items-center justify-center gap-2 cursor-pointer hover:bg-accent/10 transition-colors disabled:opacity-50"
              >
                {translating ? (
                  <span className="font-sans text-xs text-accent">Translating...</span>
                ) : (
                  <>
                    <Languages size={14} className="text-accent" />
                    <span className="font-sans text-xs text-accent">
                      Translate to {language === "ro" ? "English" : "Romanian"}
                    </span>
                  </>
                )}
              </button>

              {(titleTranslation || bodyTranslation) && (
                <div className="border border-border rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-bg-card hover:bg-bg-elevated transition-colors"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
                      Translation ({language === "ro" ? "EN" : "RO"})
                    </span>
                    {showTranslation ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                  </button>
                  {showTranslation && (
                    <div className="p-3 flex flex-col gap-3">
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[1px] text-text-muted mb-1 block">Title</label>
                        <input
                          type="text"
                          value={titleTranslation}
                          onChange={(e) => setTitleTranslation(e.target.value)}
                          className="w-full border border-border bg-transparent rounded py-2 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[1px] text-text-muted mb-1 block">Body</label>
                        <textarea
                          value={bodyTranslation}
                          onChange={(e) => setBodyTranslation(e.target.value)}
                          rows={8}
                          className="w-full border border-border bg-transparent rounded py-2 px-3 text-text-primary font-mono text-xs leading-relaxed focus:outline-none focus:border-accent-dim resize-y"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

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
