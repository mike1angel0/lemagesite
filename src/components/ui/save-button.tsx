"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleSaveAction } from "@/lib/actions/saved";
import { useState } from "react";
import Link from "next/link";

interface SaveButtonProps {
  contentType: string;
  contentId: string;
  saved: boolean;
}

export function SaveButton({ contentType, contentId, saved }: SaveButtonProps) {
  const { data: session } = useSession();
  const tc = useTranslations("common");
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, setPending] = useState(false);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2 font-sans text-xs text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors tracking-[1px] uppercase"
        title={tc("save")}
      >
        <Bookmark className="size-3.5" />
        <span>{tc("save")}</span>
      </Link>
    );
  }

  async function handleClick() {
    setPending(true);
    setIsSaved(!isSaved);

    const formData = new FormData();
    formData.set("contentType", contentType);
    formData.set("contentId", contentId);

    try {
      const result = await toggleSaveAction(formData);
      if (result && "saved" in result) {
        setIsSaved(result.saved ?? false);
      }
    } catch {
      setIsSaved(isSaved); // revert on error
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2 font-sans text-xs text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors tracking-[1px] uppercase disabled:opacity-50"
      title={isSaved ? tc("unsave") : tc("save")}
    >
      {isSaved ? (
        <BookmarkCheck className="size-3.5 text-accent" />
      ) : (
        <Bookmark className="size-3.5" />
      )}
      <span>{isSaved ? tc("saved") : tc("save")}</span>
    </button>
  );
}
