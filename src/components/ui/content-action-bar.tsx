"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { ShareSheet, type ImageFormat, type ImagePlatform } from "./share-sheet";
import { SaveButton } from "./save-button";

interface ContentActionBarProps {
  /** Content ID for the save button */
  contentId: string;
  /** Content type for the save button (POEM, ESSAY, RESEARCH, etc.) */
  contentType: string;
  /** Page title for sharing */
  title: string;
  /** Whether the user has saved this */
  saved?: boolean;
  /** Previous article slug (full path) */
  prevSlug?: string | null;
  /** Next article slug (full path) */
  nextSlug?: string | null;
  /** Previous label */
  prevLabel?: string;
  /** Next label */
  nextLabel?: string;
  /** Called when user wants to generate an image */
  onGenerateImage?: (platform: ImagePlatform, format: ImageFormat) => void;
  /** Which image is currently generating */
  generatingImage?: { platform: ImagePlatform; format: ImageFormat } | null;
  /** Whether to show image gen section in share sheet */
  showImageGen?: boolean;
}

export function ContentActionBar({
  contentId,
  contentType,
  title,
  saved = false,
  prevSlug,
  nextSlug,
  prevLabel = "Previous",
  nextLabel = "Next",
  onGenerateImage,
  generatingImage,
  showImageGen = true,
}: ContentActionBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleGenerateImage = useCallback(
    (platform: ImagePlatform, format: ImageFormat) => {
      onGenerateImage?.(platform, format);
    },
    [onGenerateImage],
  );

  return (
    <>
      <div className="flex flex-col gap-4 px-5 md:px-20 py-8">
        {/* Share button — centered */}
        <div className="flex justify-center">
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-2.5 border border-border rounded-full px-6 py-2.5 font-sans text-xs text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors"
          >
            <Share2 className="size-4" />
            <span className="tracking-[1px] uppercase">Share</span>
          </button>
        </div>

        {/* Nav row: Prev / Save / Next */}
        <div className="flex items-center justify-between">
          <div className="w-[120px]">
            {prevSlug && (
              <Link
                href={prevSlug}
                className="font-sans text-xs text-accent-dim hover:text-accent tracking-[0.5px] transition-colors"
              >
                ← {prevLabel}
              </Link>
            )}
          </div>

          <SaveButton
            contentType={contentType}
            contentId={contentId}
            saved={saved}
          />

          <div className="w-[120px] text-right">
            {nextSlug && (
              <Link
                href={nextSlug}
                className="font-sans text-xs text-accent hover:text-text-primary tracking-[0.5px] transition-colors"
              >
                {nextLabel} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <ShareSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={title}
        onGenerateImage={showImageGen ? handleGenerateImage : undefined}
        generatingImage={generatingImage}
        showImageGen={showImageGen}
      />
    </>
  );
}
