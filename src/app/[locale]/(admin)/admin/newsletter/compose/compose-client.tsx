"use client";

import { useState, useActionState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  FileText,
  ImageIcon,
  BookOpen,
  FlaskConical,
  Calendar,
  X,
  Plus,
  Search,
  ChevronDown,
  Users,
  Eye,
  PenLine,
  GripVertical,
  Globe,
} from "lucide-react";
import { createNewsletterAction } from "@/lib/actions/newsletter";
import { searchContentForLinkingAction, getRecipientCountAction } from "@/lib/actions/newsletter";
import type { LinkedContentItem } from "@/lib/actions/newsletter";
import type { AuthState } from "@/lib/actions/auth";

// Site theme colors
const C = {
  bg: "#0B0E13",
  bgSurface: "#111621",
  bgCard: "#141A26",
  bgElevated: "#1A2030",
  textPrimary: "#E8ECF2",
  textSecondary: "#7A8599",
  textMuted: "#3D4556",
  accent: "#A8B4C8",
  accentDim: "#5A6A82",
  border: "#1E2738",
  borderStrong: "#2A3548",
  gold: "#C9A962",
} as const;

const toolbarButtons = [
  { icon: Bold, label: "Bold", md: "**" },
  { icon: Italic, label: "Italic", md: "*" },
  { icon: Underline, label: "Underline", md: "<u>" },
  { icon: Strikethrough, label: "Strikethrough", md: "~~" },
  null,
  { icon: Link2, label: "Link", md: "[" },
  { icon: Image, label: "Image", md: "![" },
  null,
  { icon: List, label: "Bullet List", md: "- " },
  { icon: ListOrdered, label: "Ordered List", md: "1. " },
  { icon: Quote, label: "Blockquote", md: "> " },
  { icon: Code, label: "Code", md: "`" },
  { icon: Minus, label: "Divider", md: "\n---\n" },
];

const contentTypeIcons: Record<string, typeof FileText> = {
  Poem: FileText,
  Photo: ImageIcon,
  Essay: BookOpen,
  Research: FlaskConical,
  Event: Calendar,
};

const contentTypeLabels: Record<string, string> = {
  Poem: "POEM",
  Photo: "PHOTO",
  Essay: "ESSAY",
  Research: "PAPER",
  Event: "EVENT",
};

const localeDefaults = {
  en: {
    headerTitle: "Selenarium",
    headerSubtitle: "Dispatches from the Observatory",
    footerText: "You received this because you subscribed to Selenarium.",
    unsubscribe: "Unsubscribe",
    viewInBrowser: "View in browser",
  },
  ro: {
    headerTitle: "Selenarium",
    headerSubtitle: "Transmisiuni din Observator",
    footerText: "Ai primit acest email pentru că ești abonat la Selenarium.",
    unsubscribe: "Dezabonare",
    viewInBrowser: "Vezi în browser",
  },
} as const;

const tierOptions = ["FREE", "SUPPORTER", "PATRON", "INNER_CIRCLE"];
const tierLabels: Record<string, string> = {
  FREE: "Free",
  SUPPORTER: "Supporter",
  PATRON: "Patron",
  INNER_CIRCLE: "Inner Circle",
};

function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, `<h3 style="font-family:Georgia,serif;font-size:18px;font-weight:400;color:${C.textPrimary};margin:24px 0 8px">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:${C.textPrimary};margin:28px 0 10px">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:${C.textPrimary};margin:32px 0 12px">$1</h1>`)
    .replace(/^---$/gm, `<hr style="border:none;border-top:1px solid ${C.border};margin:24px 0">`)
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/`(.+?)`/g, `<code style="background:${C.bgElevated};padding:2px 6px;border-radius:3px;font-size:13px">$1</code>`)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;margin:16px 0">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${C.accent};text-decoration:underline">$1</a>`)
    .replace(/^&gt; (.+)$/gm, `<blockquote style="border-left:3px solid ${C.accentDim};padding-left:16px;margin:16px 0;font-style:italic;color:${C.textSecondary}">$1</blockquote>`)
    .replace(/^- (.+)$/gm, `<li style="margin:4px 0;margin-left:20px;color:${C.textSecondary}">$1</li>`)
    .replace(/^\d+\. (.+)$/gm, `<li style="margin:4px 0;margin-left:20px;color:${C.textSecondary};list-style-type:decimal">$1</li>`);

  html = html.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, '<ul style="padding:0;margin:12px 0">$1</ul>');

  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<hr") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<ul") || trimmed.startsWith("<li") || trimmed.startsWith("<img")) return line;
      return `<p style="margin:0 0 12px;line-height:1.7;color:${C.textSecondary}">${line}</p>`;
    })
    .join("\n");

  return html;
}

function EmbedCardPreview({ item }: { item: LinkedContentItem }) {
  const hasImage = item.image && item.type === "Photo";

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
      {hasImage && (
        <div style={{ height: 180, position: "relative", background: C.bgCard }}>
          <NextImage src={item.image!} alt={item.title} fill className="object-cover" />
        </div>
      )}
      <div style={{ padding: "16px 20px", background: C.bgCard }}>
        <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: C.accentDim, textTransform: "uppercase", margin: "0 0 6px" }}>
          {contentTypeLabels[item.type] || item.type}
          {item.meta ? ` · ${item.meta}` : ""}
        </p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 400, color: C.textPrimary, margin: "0 0 8px", lineHeight: 1.3 }}>
          {item.title}
        </p>
        {item.excerpt && (
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>
            {item.excerpt.length > 160 ? item.excerpt.slice(0, 160) + "..." : item.excerpt}
          </p>
        )}
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: C.accent, marginTop: 12, letterSpacing: 1, textTransform: "uppercase" }}>
          Read more &rarr;
        </p>
      </div>
    </div>
  );
}

export function ComposeNewsletterClient({ subscriberCount }: { subscriberCount: number }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [audience, setAudience] = useState("all");
  const [minimumTier, setMinimumTier] = useState("FREE");
  const [schedule, setSchedule] = useState("immediately");
  const [sendDate, setSendDate] = useState("");
  const [sendTime, setSendTime] = useState("09:00");
  const [fromName, setFromName] = useState("Mihai Gavrilescu");
  const [replyTo, setReplyTo] = useState("");
  const [embeddedContent, setEmbeddedContent] = useState<LinkedContentItem[]>([]);
  const [recipientCount, setRecipientCount] = useState(subscriberCount);
  const [locale, setLocale] = useState<"en" | "ro">("en");
  const [headerTitle, setHeaderTitle] = useState<string>(localeDefaults.en.headerTitle);
  const [headerSubtitle, setHeaderSubtitle] = useState<string>(localeDefaults.en.headerSubtitle);
  const [footerText, setFooterText] = useState<string>(localeDefaults.en.footerText);

  const localeStrings = localeDefaults[locale];

  const previewHtml = useMemo(() => markdownToHtml(body), [body]);

  // Content picker state
  const [showContentPicker, setShowContentPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LinkedContentItem[]>([]);
  const [searching, setSearching] = useState(false);

  const [createState, createAction, createPending] = useActionState(createNewsletterAction, {} as AuthState);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    setSearching(true);
    const results = await searchContentForLinkingAction(q);
    const embeddedIds = new Set(embeddedContent.map((c) => c.id));
    setSearchResults(results.filter((r) => !embeddedIds.has(r.id)));
    setSearching(false);
  }, [embeddedContent]);

  function addContent(item: LinkedContentItem) {
    setEmbeddedContent((prev) => [...prev, item]);
    setSearchResults((prev) => prev.filter((r) => r.id !== item.id));
  }

  function removeContent(id: string) {
    setEmbeddedContent((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleTierChange(tier: string) {
    setMinimumTier(tier);
    const count = await getRecipientCountAction(tier);
    setRecipientCount(count);
  }

  function buildFormData(shouldSchedule: boolean) {
    const fd = new FormData();
    fd.set("subject", subject);
    fd.set("previewText", previewText);
    fd.set("body", body);
    fd.set("audience", audience);
    fd.set("minimumTier", minimumTier);
    fd.set("fromName", fromName);
    fd.set("replyTo", replyTo);
    fd.set("schedule", shouldSchedule ? "true" : "false");
    if (shouldSchedule && sendDate) {
      fd.set("scheduledAt", `${sendDate}T${sendTime}`);
    }
    if (embeddedContent.length > 0) {
      fd.set("linkedContent", JSON.stringify(embeddedContent));
    }
    return fd;
  }

  function handleSaveDraft() {
    createAction(buildFormData(false));
  }

  function handleScheduleOrSend() {
    if (!subject.trim() || !body.trim()) return;
    createAction(buildFormData(schedule === "scheduled"));
  }

  if (createState.success) {
    router.push("/admin/newsletter");
    return null;
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-sans text-[18px] font-semibold text-text-primary">Compose Newsletter</h1>
          <span className="bg-gold/10 text-gold rounded px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((p) => !p)}
            className={`inline-flex items-center gap-1.5 border rounded-md px-4 py-2 font-sans text-sm transition-colors ${
              showPreview
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-text-secondary hover:border-accent-dim hover:text-text-primary"
            }`}
          >
            {showPreview ? <PenLine size={14} /> : <Eye size={14} />}
            {showPreview ? "Editor" : "Preview"}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={createPending || !subject.trim()}
            className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {createPending ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleScheduleOrSend}
            disabled={createPending || !subject.trim() || !body.trim()}
            className="bg-gold rounded-md px-4 py-2 font-sans text-sm text-bg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {schedule === "scheduled" && sendDate ? "Schedule Send" : "Send Now"}
          </button>
        </div>
      </div>

      {createState.error && (
        <div className="mx-8 mt-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{createState.error}</div>
      )}

      {/* Two-Column Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Editor / Preview */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject..."
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block">Preview Text</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Short preview..."
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {showPreview ? (
            /* ── Email Preview ── */
            <div className="border border-border rounded overflow-hidden">
              {/* Email chrome */}
              <div className="bg-bg-elevated border-b border-border px-6 py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-text-muted tracking-[1px] uppercase w-16 shrink-0">From</span>
                  <span className="font-sans text-sm text-text-primary">{fromName || "Selenarium"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-text-muted tracking-[1px] uppercase w-16 shrink-0">Subject</span>
                  <span className="font-sans text-sm text-text-primary">{subject || "(no subject)"}</span>
                </div>
                {previewText && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-text-muted tracking-[1px] uppercase w-16 shrink-0">Preview</span>
                    <span className="font-sans text-sm text-text-muted">{previewText}</span>
                  </div>
                )}
              </div>

              {/* Email body — uses site bg color */}
              <div style={{ background: C.bg, padding: 32, minHeight: 400 }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                  {/* Header */}
                  <div style={{ textAlign: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 24, marginBottom: 24 }}>
                    <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 4, color: C.accent, textTransform: "uppercase", margin: 0 }}>{headerTitle}</p>
                    <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: C.textMuted, marginTop: 4, textTransform: "uppercase" }}>{headerSubtitle}</p>
                  </div>

                  {/* Content */}
                  {body.trim() ? (
                    <div
                      className="font-serif text-[15px] leading-[1.7]"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <p className="font-sans text-sm text-text-muted text-center py-12">
                      Start writing to see a preview...
                    </p>
                  )}

                  {/* Embedded content cards */}
                  {embeddedContent.length > 0 && (
                    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 32, paddingTop: 24 }}>
                      <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: C.textMuted, textTransform: "uppercase", marginBottom: 16 }}>
                        Featured Content
                      </p>
                      {embeddedContent.map((item) => (
                        <EmbedCardPreview key={item.id} item={item} />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ textAlign: "center", borderTop: `1px solid ${C.border}`, marginTop: 32, paddingTop: 24 }}>
                    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: C.textMuted, margin: 0 }}>
                      {footerText}
                    </p>
                    <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                      <span style={{ color: C.accent, textDecoration: "underline", cursor: "pointer" }}>{localeStrings.unsubscribe}</span>
                      {" · "}
                      <span style={{ color: C.accent, textDecoration: "underline", cursor: "pointer" }}>{localeStrings.viewInBrowser}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Editor ── */
            <>
              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-1 bg-bg-card border border-border rounded p-1">
                {toolbarButtons.map((btn, i) =>
                  btn === null ? (
                    <div key={`sep-${i}`} className="w-px h-5 bg-border mx-1" />
                  ) : (
                    <button key={btn.label} title={btn.label} className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                      <btn.icon size={16} />
                    </button>
                  )
                )}
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your newsletter..."
                className="w-full min-h-[400px] bg-bg-card border border-border rounded p-6 font-serif text-base leading-relaxed text-text-primary placeholder:text-text-muted/50 resize-y focus:outline-none focus:border-accent transition-colors"
              />

              {/* Embedded content list in editor mode */}
              {embeddedContent.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Embedded Posts</p>
                  {embeddedContent.map((item) => {
                    const Icon = contentTypeIcons[item.type] || FileText;
                    return (
                      <div key={item.id} className="flex items-start gap-3 bg-bg-card border border-border rounded-lg p-3">
                        <GripVertical className="h-4 w-4 text-text-muted/40 shrink-0 mt-0.5" />
                        {item.image && (
                          <div className="w-16 h-12 rounded overflow-hidden shrink-0 relative">
                            <NextImage src={item.image} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3 w-3 text-accent-dim shrink-0" />
                            <span className="font-mono text-[9px] text-text-muted tracking-wide uppercase">{item.type}</span>
                            {item.meta && <span className="font-mono text-[9px] text-text-muted">· {item.meta}</span>}
                          </div>
                          <p className="font-serif text-sm text-text-primary mt-0.5 truncate">{item.title}</p>
                          {item.excerpt && (
                            <p className="font-sans text-[11px] text-text-secondary mt-0.5 line-clamp-1">{item.excerpt}</p>
                          )}
                        </div>
                        <button onClick={() => removeContent(item.id)} className="text-text-muted hover:text-red-400 transition-colors shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="w-[320px] bg-bg-surface border-l border-border p-5 space-y-5 overflow-y-auto">
          {/* Audience */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Audience</p>
            <div className="relative">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full appearance-none border border-border bg-bg-card rounded py-2 px-3 pr-8 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="all">All Subscribers</option>
                <option value="paying">Paying Members Only</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Minimum Tier */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Minimum Tier</p>
            <div className="relative">
              <select
                value={minimumTier}
                onChange={(e) => handleTierChange(e.target.value)}
                className="w-full appearance-none border border-border bg-bg-card rounded py-2 px-3 pr-8 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                {tierOptions.map((t) => (
                  <option key={t} value={t}>{tierLabels[t]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Recipient Count */}
          <div className="flex items-center gap-2 bg-bg-card border border-border rounded py-2.5 px-3">
            <Users className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-sans text-sm text-text-primary">{recipientCount.toLocaleString()}</span>
            <span className="font-sans text-xs text-text-muted">recipients</span>
          </div>

          <div className="border-t border-border" />

          {/* Schedule */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Schedule</p>
            <div className="relative">
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full appearance-none border border-border bg-bg-card rounded py-2 px-3 pr-8 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="immediately">Send immediately</option>
                <option value="scheduled">Schedule for later</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            </div>
            {schedule === "scheduled" && (
              <div className="flex gap-2 mt-2">
                <input
                  type="date"
                  value={sendDate}
                  onChange={(e) => setSendDate(e.target.value)}
                  className="flex-1 border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
                <input
                  type="time"
                  value={sendTime}
                  onChange={(e) => setSendTime(e.target.value)}
                  className="w-24 border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* From Name */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">From Name</p>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Sender name"
              className="w-full border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Reply-To */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Reply-To</p>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="reply@example.com"
              className="w-full border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="border-t border-border" />

          {/* Language */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Language</p>
            <div className="flex gap-2">
              {(["en", "ro"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLocale(l);
                    const d = localeDefaults[l];
                    setHeaderTitle(d.headerTitle);
                    setHeaderSubtitle(d.headerSubtitle);
                    setFooterText(d.footerText);
                  }}
                  className={`flex items-center gap-1.5 flex-1 justify-center border rounded py-2 px-3 font-sans text-sm transition-colors ${
                    locale === l
                      ? "border-accent text-accent bg-accent/10"
                      : "border-border text-text-secondary hover:border-accent-dim hover:text-text-primary"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {l === "en" ? "English" : "Română"}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Header Title</p>
            <input
              type="text"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder={localeStrings.headerTitle}
              className="w-full border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Header Subtitle</p>
            <input
              type="text"
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              placeholder={localeStrings.headerSubtitle}
              className="w-full border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Footer */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Footer Text</p>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder={localeStrings.footerText}
              className="w-full border border-border bg-bg-card rounded py-2 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="border-t border-border" />

          {/* Embed Content */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Embed Content</p>
            <p className="font-sans text-[11px] text-text-muted leading-relaxed">
              Embed posts directly into the newsletter with title, excerpt, and image.
            </p>

            {embeddedContent.length > 0 && (
              <div className="space-y-1.5">
                {embeddedContent.map((item) => {
                  const Icon = contentTypeIcons[item.type] || FileText;
                  return (
                    <div key={item.id} className="flex items-center gap-2 bg-bg-card border border-border rounded py-2 px-3">
                      <Icon className="h-3.5 w-3.5 text-accent-dim shrink-0" />
                      <span className="font-sans text-[12px] text-text-primary truncate flex-1">{item.title}</span>
                      <button onClick={() => removeContent(item.id)} className="text-text-muted hover:text-red-400 transition-colors shrink-0">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!showContentPicker ? (
              <button
                onClick={() => { setShowContentPicker(true); handleSearch(""); }}
                className="flex items-center gap-1.5 font-sans text-xs text-accent hover:text-accent/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Embed a post
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search posts..."
                    autoFocus
                    className="w-full border border-border bg-bg-card rounded py-2 pl-8 pr-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="max-h-[240px] overflow-y-auto space-y-1">
                  {searching && <p className="font-sans text-xs text-text-muted py-2 text-center">Searching...</p>}
                  {!searching && searchResults.length === 0 && (
                    <p className="font-sans text-xs text-text-muted py-2 text-center">No results</p>
                  )}
                  {searchResults.map((item) => {
                    const Icon = contentTypeIcons[item.type] || FileText;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addContent(item)}
                        className="w-full flex items-start gap-2 rounded py-2 px-2 hover:bg-bg-elevated transition-colors text-left"
                      >
                        <Icon className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-sans text-sm text-text-primary block truncate">{item.title}</span>
                          {item.excerpt && (
                            <span className="font-sans text-[11px] text-text-muted block truncate">{item.excerpt}</span>
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-text-muted tracking-wide uppercase shrink-0 mt-0.5">{item.type}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => { setShowContentPicker(false); setSearchQuery(""); setSearchResults([]); }}
                  className="font-sans text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
