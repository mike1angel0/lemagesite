"use client";

import { useState } from "react";
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
  LinkIcon,
} from "lucide-react";

const toolbarButtons = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Underline, label: "Underline" },
  { icon: Strikethrough, label: "Strikethrough" },
  null,
  { icon: Link2, label: "Link" },
  { icon: Image, label: "Image" },
  null,
  { icon: List, label: "Bullet List" },
  { icon: ListOrdered, label: "Ordered List" },
  { icon: Quote, label: "Blockquote" },
  { icon: Code, label: "Code" },
  { icon: Minus, label: "Divider" },
];

const defaultBody = `Dear fellow observers,

March has arrived with its particular quality of light — that liminal glow between winter's retreat and spring's slow unfurling. I've been spending mornings at the window, watching how shadows lengthen and shorten, mapping the geometry of a season in transition.

This month brings new poems from the "Cartography of Silence" series, a winter photography collection I've titled "Fog Studies," and a brief essay on the art of listening to what remains unsaid.

---

**New Poems: Cartography of Silence**

Three new poems have emerged from the silence of February. They are attempts to chart the unmappable — the spaces between words, the pauses in conversation where meaning lives.

*"We draw borders around silence
as if it were a country we could visit,
passport stamped with the ink of longing."*

Read the full series on the Selenarium.

---

**Winter Light Series**

The final photographs from the winter collection are now available. Shot on medium format film during the coldest week of January, they capture a quality of light that exists for perhaps ten minutes each morning.

---

With quiet regards,
Mihai`;

export default function ComposeNewsletterPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState(defaultBody);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [sendDate, setSendDate] = useState("");
  const [sendTime, setSendTime] = useState("09:00");

  const handleSaveTest = async () => {
    setSaving(true);
    setSaved(false);
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleScheduleSend = () => {
    if (scheduling) {
      // Confirm — redirect
      router.push("/admin/newsletter");
      return;
    }
    setScheduling(true);
  };

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-sans text-[18px] font-semibold text-text-primary">
            Compose Newsletter
          </h1>
          <span className="bg-[#2A1A0D] text-gold rounded px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase">
            Draft
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Preview coming soon")}
            className="border border-border rounded-md px-4 py-2 font-sans text-sm text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSaveTest}
            disabled={saving}
            className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Test"}
          </button>
          <button
            onClick={handleScheduleSend}
            className="bg-gold rounded-md px-4 py-2 font-sans text-sm text-bg hover:opacity-90 transition-opacity"
          >
            {scheduling ? "Confirm Send" : "Schedule Send"}
          </button>
        </div>
      </div>

      {/* ── Two-Column Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: Editor ── */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Subject Line */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Selenarium Dispatch #26 — Cartography of Silence"
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Preview Text */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block">
              Preview Text
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="New poems, winter photography, and a reflection on silence..."
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 bg-bg-card border border-border rounded p-1">
            {toolbarButtons.map((btn, i) =>
              btn === null ? (
                <div
                  key={`sep-${i}`}
                  className="w-px h-5 bg-border mx-1"
                />
              ) : (
                <button
                  key={btn.label}
                  title={btn.label}
                  onClick={() => alert("Formatting coming soon")}
                  className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <btn.icon size={16} />
                </button>
              ),
            )}
          </div>

          {/* Body Textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full min-h-[400px] bg-bg-card border border-border rounded p-6 font-serif text-base leading-relaxed text-text-primary placeholder:text-text-muted/50 resize-y focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="w-[320px] bg-bg-surface border-l border-border p-5 space-y-5 overflow-y-auto">
          {/* All Subscribers */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase mb-2">
              All Subscribers
            </p>
            <p className="font-serif text-3xl text-text-primary">2,341</p>
            <p className="text-xs text-text-muted mt-1">
              subscribers will receive this
            </p>
          </div>

          {/* Send Schedule */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Send Schedule
            </p>
            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary block">
                Date
              </label>
              <input
                type="date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="font-sans text-xs text-text-secondary block">
                Time
              </label>
              <input
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2 px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Attach Content */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Attach Content
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-bg-card border border-border rounded px-3 py-2.5">
                <LinkIcon size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="font-sans text-[13px] text-text-primary truncate">
                    Cartography of Silence
                  </p>
                  <p className="font-mono text-[10px] text-text-muted">Poem</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-bg-card border border-border rounded px-3 py-2.5">
                <LinkIcon size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="font-sans text-[13px] text-text-primary truncate">
                    Winter Light Series
                  </p>
                  <p className="font-mono text-[10px] text-text-muted">Photo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling confirmation */}
          {scheduling && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
              <p className="font-sans text-sm text-gold font-medium mb-1">
                Ready to schedule?
              </p>
              <p className="font-sans text-xs text-text-muted">
                This newsletter will be sent to 2,341 subscribers
                {sendDate ? ` on ${sendDate}` : ""}{" "}
                {sendTime ? `at ${sendTime}` : ""}.
              </p>
              <button
                onClick={() => setScheduling(false)}
                className="font-sans text-xs text-text-muted underline mt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
