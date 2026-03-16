"use client";

import { useState, useCallback } from "react";
import { ContentActionBar } from "./content-action-bar";
import type { ImageFormat, ImagePlatform } from "./share-sheet";
import {
  FORMATS,
  ensureFontsLoaded,
  loadImage,
  canvasToBlob,
  downloadBlob,
  drawVignette,
  drawInsetBorder,
  drawCoverFit,
  drawGoldDivider,
  drawBottomBar,
  slugify,
} from "./image-gen-utils";

interface PoemActionBarProps {
  poemId: string;
  title: string;
  stanzas: string[];
  bgImage: string;
  saved?: boolean;
  prevSlug?: string | null;
  nextSlug?: string | null;
  prevLabel?: string;
  nextLabel?: string;
}

const STANZAS_PER_PAGE: Record<"square" | "story", number> = {
  square: 2,
  story: 4,
};

function renderPoemImage(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  pageStanzas: string[],
  format: "square" | "story",
  currentPage: number,
  totalPages: number,
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.fillStyle = "#0A0806";
  ctx.fillRect(0, 0, w, h);

  if (bgImg) drawCoverFit(ctx, bgImg, w, h);

  ctx.fillStyle = "rgba(10, 8, 6, 0.72)";
  ctx.fillRect(0, 0, w, h);
  drawVignette(ctx, w, h);
  drawInsetBorder(ctx, w, h);

  const padding = 80;
  const contentWidth = w - padding * 2;
  const isStory = format === "story";

  const titleSize = isStory ? 52 : 46;
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const titleY = isStory ? 200 : 150;
  ctx.fillText(title, w / 2, titleY, contentWidth);

  const dividerY = titleY + 48;
  drawGoldDivider(ctx, w / 2, dividerY, 60);

  const fontSize = isStory ? 34 : 30;
  const lineHeight = fontSize * 1.75;
  const stanzaGap = isStory ? 44 : 36;
  ctx.font = `300 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let totalTextHeight = 0;
  const stanzaLines: string[][] = [];
  for (const stanza of pageStanzas) {
    const lines = stanza.split("\n");
    stanzaLines.push(lines);
    totalTextHeight += lines.length * lineHeight;
  }
  totalTextHeight += (pageStanzas.length - 1) * stanzaGap;

  const textAreaTop = dividerY + 40;
  const bottomBarHeight = isStory ? 180 : 140;
  const textAreaBottom = h - bottomBarHeight;
  const textAreaHeight = textAreaBottom - textAreaTop;
  let y = textAreaTop + (textAreaHeight - totalTextHeight) / 2 + fontSize / 2;

  for (let i = 0; i < stanzaLines.length; i++) {
    for (const line of stanzaLines[i]) {
      ctx.fillText(line, w / 2, y, contentWidth);
      y += lineHeight;
    }
    if (i < stanzaLines.length - 1) y += stanzaGap;
  }

  drawBottomBar(
    ctx, w, h, padding, bottomBarHeight,
    "LEMAGEPOET",
    totalPages > 1 ? `${currentPage + 1} / ${totalPages}` : "Poetry",
    logoImg,
  );
}

export function PoemActionBar({
  poemId,
  title,
  stanzas,
  bgImage,
  saved = false,
  prevSlug,
  nextSlug,
  prevLabel = "Previous",
  nextLabel = "Next",
}: PoemActionBarProps) {
  const [generatingImage, setGeneratingImage] = useState<{
    platform: ImagePlatform;
    format: ImageFormat;
  } | null>(null);

  const handleGenerateImage = useCallback(
    async (platform: ImagePlatform, format: ImageFormat) => {
      setGeneratingImage({ platform, format });
      try {
        await ensureFontsLoaded();
        const perPage = STANZAS_PER_PAGE[format];
        const totalPages = Math.max(1, Math.ceil(stanzas.length / perPage));

        const [bgImg, logoImg] = await Promise.all([
          bgImage ? loadImage(bgImage).catch(() => null) : Promise.resolve(null),
          loadImage("/logo.png").catch(() => null),
        ]);

        const canvas = document.createElement("canvas");
        const slug = slugify(title);
        const prefix = platform === "tiktok" ? "tt" : "ig";

        const blobs: { blob: Blob; filename: string }[] = [];
        for (let page = 0; page < totalPages; page++) {
          const pageStanzas = stanzas.slice(page * perPage, (page + 1) * perPage);
          renderPoemImage(canvas, bgImg, logoImg, title, pageStanzas, format, page, totalPages);
          const blob = await canvasToBlob(canvas);
          const suffix = totalPages > 1 ? `-${page + 1}` : "";
          blobs.push({ blob, filename: `${slug}-${prefix}-${format}${suffix}.png` });
        }

        for (let i = 0; i < blobs.length; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 500));
          downloadBlob(blobs[i].blob, blobs[i].filename);
        }
      } catch (err) {
        console.error("Image generation failed:", err);
      } finally {
        setGeneratingImage(null);
      }
    },
    [title, stanzas, bgImage],
  );

  return (
    <ContentActionBar
      contentId={poemId}
      contentType="POEM"
      title={title}
      saved={saved}
      prevSlug={prevSlug}
      nextSlug={nextSlug}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      onGenerateImage={handleGenerateImage}
      generatingImage={generatingImage}
    />
  );
}
