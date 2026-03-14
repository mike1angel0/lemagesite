"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

type Status = "draft" | "saving" | "saved" | "publishing";

export default function AdminEditorNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Poetry");
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
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const isBusy = status === "saving" || status === "publishing";

  async function handleSave() {
    if (!title.trim() || isBusy) return;
    setStatus("saving");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("saved");
    setTimeout(() => setStatus("draft"), 2000);
  }

  async function handlePublish() {
    if (!title.trim() || isBusy) return;
    setStatus("publishing");
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/admin/content");
  }

  const toolbarButtons = [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Underline, label: "Underline" },
    { icon: LinkIcon, label: "Link" },
    { icon: List, label: "List" },
    { icon: Quote, label: "Quote" },
    { icon: Code, label: "Code" },
    { icon: ImageIcon, label: "Image" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-sans text-[18px] font-semibold text-text-primary">
            New {category}
          </h1>
          <span className="bg-[#2A1A0D] text-gold rounded px-2 py-0.5 font-mono text-[10px] tracking-[1px] inline-flex items-center gap-1">
            {status === "saving" ? (
              "Saving..."
            ) : status === "saved" ? (
              <>
                <Check size={10} />
                Saved
              </>
            ) : status === "publishing" ? (
              "Publishing..."
            ) : (
              "Draft"
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Preview coming soon")}
            className="border border-border rounded-md px-4 py-2 font-sans text-sm text-text-primary hover:bg-bg-elevated transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isBusy || !title.trim()}
            className="bg-accent rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isBusy || !title.trim()}
            className="bg-gold rounded-md px-4 py-2 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors"
          >
            Publish
          </button>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Editor */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          <input
            type="text"
            placeholder="Cartography of Silence"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif text-2xl text-text-primary border-b border-border pb-4 bg-transparent w-full focus:outline-none placeholder:text-text-muted"
          />

          {/* Rich text toolbar */}
          <div className="flex items-center gap-1 bg-bg-card rounded border border-border px-2 py-1.5">
            {toolbarButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                title={label}
                onClick={() => alert("Formatting coming soon")}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Begin writing..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full font-serif text-base leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y"
          />
        </div>

        {/* Right: Sidebar */}
        <div className="w-[320px] bg-bg-surface border-l border-border p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Category */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim"
            >
              <option>Poetry</option>
              <option>Photography</option>
              <option>Essay</option>
              <option>Music</option>
              <option>Research</option>
            </select>
          </div>

          {/* Membership Tier */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
              Membership Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim"
            >
              <option>Free</option>
              <option>Supporter</option>
              <option>Patron</option>
              <option>Inner Circle</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
              Tags
            </label>
            <input
              type="text"
              placeholder="Add tags, separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
            />
          </div>

          {/* Research-specific fields */}
          {category === "Research" && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                  Abstract
                </label>
                <textarea
                  placeholder="Paper abstract..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted resize-y min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Year
                  </label>
                  <input
                    type="number"
                    placeholder="2026"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    DOI
                  </label>
                  <input
                    type="text"
                    placeholder="10.xxxx/xxxxx"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                  PDF URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                />
              </div>
            </>
          )}

          {/* Photography-specific fields */}
          {category === "Photography" && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                  Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                  Series
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fog Studies"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Camera
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony A7III"
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bucharest"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
              </div>
            </>
          )}

          {/* Essay-specific fields */}
          {category === "Essay" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Read Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12 min"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI & Philosophy"
                    value={essayCategory}
                    onChange={(e) => setEssayCategory(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
              </div>
            </>
          )}

          {/* Music-specific fields */}
          {category === "Music" && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                  Album
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nocturnal Echoes"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4:32"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
                    Audio URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
                  />
                </div>
              </div>
            </>
          )}

          {/* Featured Image */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
              Featured Image
            </label>
            <div onClick={() => alert("Upload coming soon")} className="w-full h-[100px] border border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-accent-dim transition-colors">
              <span className="font-sans text-xs text-text-muted">
                Click to upload image
              </span>
            </div>
          </div>

          {/* Audio / Media */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-2 block">
              Audio / Media
            </label>
            <div onClick={() => alert("Upload coming soon")} className="w-full h-[70px] border border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-accent-dim transition-colors">
              <span className="font-sans text-xs text-text-muted">
                Click to upload media
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
                Schedule Publication
              </label>
              <button
                onClick={() => setScheduleEnabled(!scheduleEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  scheduleEnabled ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                    scheduleEnabled
                      ? "left-[22px] bg-bg"
                      : "left-0.5 bg-text-muted"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
