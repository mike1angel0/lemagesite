"use client";

import { useState, useActionState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { createNewsletterAction } from "@/lib/actions/newsletter";
import { searchContentForLinkingAction, getRecipientCountAction } from "@/lib/actions/newsletter";
import type { LinkedContentItem } from "@/lib/actions/newsletter";
import type { AuthState } from "@/lib/actions/auth";

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

const tierOptions = ["FREE", "SUPPORTER", "PATRON", "INNER_CIRCLE"];
const tierLabels: Record<string, string> = {
  FREE: "Free",
  SUPPORTER: "Supporter",
  PATRON: "Patron",
  INNER_CIRCLE: "Inner Circle",
};

export function ComposeNewsletterClient({ subscriberCount }: { subscriberCount: number }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [minimumTier, setMinimumTier] = useState("FREE");
  const [schedule, setSchedule] = useState("immediately");
  const [sendDate, setSendDate] = useState("");
  const [sendTime, setSendTime] = useState("09:00");
  const [fromName, setFromName] = useState("Mihai Gavrilescu");
  const [replyTo, setReplyTo] = useState("");
  const [linkedContent, setLinkedContent] = useState<LinkedContentItem[]>([]);
  const [recipientCount, setRecipientCount] = useState(subscriberCount);

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
    // Filter out already linked content
    const linkedIds = new Set(linkedContent.map((c) => c.id));
    setSearchResults(results.filter((r) => !linkedIds.has(r.id)));
    setSearching(false);
  }, [linkedContent]);

  function addContent(item: LinkedContentItem) {
    setLinkedContent((prev) => [...prev, item]);
    setSearchResults((prev) => prev.filter((r) => r.id !== item.id));
  }

  function removeContent(id: string) {
    setLinkedContent((prev) => prev.filter((c) => c.id !== id));
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
    if (linkedContent.length > 0) {
      fd.set("linkedContent", JSON.stringify(linkedContent));
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
          <span className="bg-[#2A1A0D] text-gold rounded px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase">Draft</span>
        </div>
        <div className="flex items-center gap-2">
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
        {/* Left: Editor */}
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

          {/* Linked Content */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Linked Content</p>

            {linkedContent.length > 0 && (
              <div className="space-y-2">
                {linkedContent.map((item) => {
                  const Icon = contentTypeIcons[item.type] || FileText;
                  return (
                    <div key={item.id} className="flex items-center gap-2 bg-bg-card border border-border rounded py-2 px-3">
                      <Icon className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <span className="font-sans text-sm text-text-primary truncate flex-1">{item.title}</span>
                      <span className="font-mono text-[9px] text-text-muted tracking-wide uppercase shrink-0">{item.type}</span>
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
                Link content
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search content..."
                    autoFocus
                    className="w-full border border-border bg-bg-card rounded py-2 pl-8 pr-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-1">
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
                        className="w-full flex items-center gap-2 rounded py-1.5 px-2 hover:bg-bg-elevated transition-colors text-left"
                      >
                        <Icon className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="font-sans text-sm text-text-primary truncate flex-1">{item.title}</span>
                        <span className="font-mono text-[9px] text-text-muted tracking-wide uppercase shrink-0">{item.type}</span>
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
