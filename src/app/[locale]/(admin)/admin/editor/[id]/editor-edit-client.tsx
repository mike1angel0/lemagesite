"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { updateContentAction } from "@/lib/actions/content";
import type { AuthState } from "@/lib/actions/auth";

type Status = "idle" | "saving" | "saved" | "error";

const tierMap: Record<string, string> = {
  FREE: "Free",
  SUPPORTER: "Supporter",
  PATRON: "Patron",
  INNER_CIRCLE: "Inner Circle",
};

interface ContentData {
  id: string;
  contentType: string;
  title: string;
  body: string;
  accessTier: string;
  publishedAt: string | null;
  [key: string]: unknown;
}

export function EditorEditClient({ content }: { content: ContentData }) {
  const router = useRouter();
  const [title, setTitle] = useState(content.title);
  const [body, setBody] = useState(content.body || "");
  const [tier, setTier] = useState(tierMap[content.accessTier] || "Free");
  const [tags, setTags] = useState((content as Record<string, unknown>).collection as string || (content as Record<string, unknown>).category as string || "");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isBusy = status === "saving";

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

    // Type-specific fields
    if (content.contentType === "Research") {
      formData.set("abstract", (content as Record<string, unknown>).abstract as string || "");
      formData.set("doi", (content as Record<string, unknown>).doi as string || "");
      formData.set("pdfUrl", (content as Record<string, unknown>).pdfUrl as string || "");
    }
    if (content.contentType === "Photo") {
      formData.set("imageUrl", (content as Record<string, unknown>).imageUrl as string || "");
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
          <span className={`rounded px-2 py-0.5 font-mono text-[10px] tracking-[1px] inline-flex items-center gap-1 ${content.publishedAt ? "bg-[#0D2818] text-[#6BBF7B]" : "bg-[#2A1A0D] text-gold"}`}>
            {status === "saving" ? "Saving..." : status === "saved" ? <><Check size={10} /> Saved</> : content.publishedAt ? "Published" : "Draft"}
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
        <div className="flex-1 p-8 flex flex-col gap-6">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="font-serif text-2xl text-text-primary border-b border-border pb-4 bg-transparent w-full focus:outline-none placeholder:text-text-muted" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[400px] flex-1 bg-bg-card border border-border rounded p-6 w-full font-serif text-base leading-relaxed text-text-secondary focus:outline-none placeholder:text-text-muted resize-y" />
        </div>

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
            <input type="text" placeholder="Add tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
