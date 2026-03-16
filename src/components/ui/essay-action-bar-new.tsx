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
  wrapText,
  slugify,
} from "./image-gen-utils";

interface EssayActionBarProps {
  essayId: string;
  title: string;
  excerpt: string;
  body: string;
  category?: string;
  readTime?: string;
  bgImage?: string;
  saved?: boolean;
}

function renderEssayImage(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  excerpt: string,
  category: string,
  readTime: string,
  format: "square" | "story",
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.fillStyle = "#1A150E";
  ctx.fillRect(0, 0, w, h);
  if (bgImg) drawCoverFit(ctx, bgImg, w, h);

  ctx.fillStyle = "rgba(26, 21, 14, 0.78)";
  ctx.fillRect(0, 0, w, h);
  drawVignette(ctx, w, h);
  drawInsetBorder(ctx, w, h);

  const padding = 80;
  const contentWidth = w - padding * 2;
  const isStory = format === "story";
  const bottomBarHeight = isStory ? 220 : 180;

  const labelHeight = 13;
  const labelGap = isStory ? 40 : 32;

  const titleSize = isStory ? 44 : 40;
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  const titleLines = wrapText(ctx, title.replace(/\n/g, " "), contentWidth);
  const titleLineHeight = titleSize * 1.3;
  const titleBlockHeight = titleLines.length * titleLineHeight;

  const authorGap = isStory ? 24 : 20;
  const authorHeight = 16;
  const metaGap = 8;
  const metaHeight = category || readTime ? 13 : 0;
  const dividerGap = isStory ? 28 : 24;
  const dividerHeight = 1;
  const excerptGap = isStory ? 28 : 24;
  const excerptFontSize = isStory ? 22 : 20;
  const excerptLineHeight = excerptFontSize * 1.7;
  ctx.font = `300 ${excerptFontSize}px "Cormorant Garamond", Georgia, serif`;
  const excerptLines = wrapText(ctx, excerpt, contentWidth - 20);

  const availableTop = padding + 32;
  const availableBottom = h - bottomBarHeight;
  const availableHeight = availableBottom - availableTop;

  const fixedHeight =
    labelHeight + labelGap + titleBlockHeight + authorGap + authorHeight +
    (metaHeight ? metaGap + metaHeight : 0) + dividerGap + dividerHeight + excerptGap;

  const excerptAvailable = availableHeight - fixedHeight;
  const maxExcerptLines = Math.max(1, Math.floor(excerptAvailable / excerptLineHeight));
  const displayLines = excerptLines.slice(0, maxExcerptLines);
  if (excerptLines.length > maxExcerptLines && displayLines.length > 0) {
    displayLines[displayLines.length - 1] = displayLines[displayLines.length - 1].replace(/\s*\S+$/, "…");
  }

  const totalHeight = fixedHeight + displayLines.length * excerptLineHeight;
  let y = availableTop + (availableHeight - totalHeight) / 2;

  ctx.font = "400 13px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  y += labelHeight / 2;
  ctx.fillText("ESSAY", w / 2, y);
  y += labelHeight / 2 + labelGap;

  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of titleLines) {
    y += titleLineHeight / 2;
    ctx.fillText(line, w / 2, y);
    y += titleLineHeight / 2;
  }

  y += authorGap;
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(245, 238, 216, 0.6)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";
  ctx.fillText("Mihai Gavrilescu, PhD", w / 2, y + authorHeight / 2);
  y += authorHeight;

  if (category || readTime) {
    y += metaGap;
    ctx.font = "400 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(245, 238, 216, 0.4)";
    ctx.letterSpacing = "1px";
    const metaText = [category, readTime].filter(Boolean).join("  ·  ");
    ctx.fillText(metaText, w / 2, y + metaHeight / 2);
    y += metaHeight;
  }

  y += dividerGap;
  drawGoldDivider(ctx, w / 2, y, 60);
  y += dividerHeight + excerptGap;

  ctx.font = `300 ${excerptFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "rgba(245, 238, 216, 0.85)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of displayLines) {
    y += excerptLineHeight / 2;
    ctx.fillText(line, w / 2, y, contentWidth);
    y += excerptLineHeight / 2;
  }

  drawBottomBar(ctx, w, h, padding, bottomBarHeight, "SELENARIUM", "Essays", logoImg);
}

function renderSummarySlide(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  summary: string,
  format: "square" | "story",
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.fillStyle = "#1A150E";
  ctx.fillRect(0, 0, w, h);
  if (bgImg) drawCoverFit(ctx, bgImg, w, h);

  ctx.fillStyle = "rgba(26, 21, 14, 0.85)";
  ctx.fillRect(0, 0, w, h);
  drawVignette(ctx, w, h);
  drawInsetBorder(ctx, w, h);

  const padding = 80;
  const contentWidth = w - padding * 2;
  const isStory = format === "story";
  const bottomBarHeight = isStory ? 220 : 180;

  const labelHeight = 13;
  const labelToTitle = isStory ? 44 : 36;
  const titleSize = isStory ? 32 : 28;
  const titleLineHeight = titleSize * 1.3;
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  const titleLines = wrapText(ctx, title, contentWidth).slice(0, 2);
  const titleBlockHeight = titleLines.length * titleLineHeight;

  const titleToDivider = isStory ? 28 : 20;
  const dividerHeight = 1;
  const dividerToSummary = isStory ? 44 : 36;

  const summaryFontSize = isStory ? 26 : 24;
  const summaryLineHeight = summaryFontSize * 1.8;
  ctx.font = `300 ${summaryFontSize}px "Cormorant Garamond", Georgia, serif`;
  const allSummaryLines = wrapText(ctx, summary, contentWidth - 40);

  const availableTop = padding + 32;
  const availableBottom = h - bottomBarHeight;
  const availableHeight = availableBottom - availableTop;
  const fixedHeight = labelHeight + labelToTitle + titleBlockHeight + titleToDivider + dividerHeight + dividerToSummary;

  const summaryAvailable = availableHeight - fixedHeight;
  const maxLines = Math.max(1, Math.floor(summaryAvailable / summaryLineHeight));
  const displayLines = allSummaryLines.slice(0, maxLines);
  if (allSummaryLines.length > maxLines && displayLines.length > 0) {
    displayLines[displayLines.length - 1] = displayLines[displayLines.length - 1].replace(/\s*\S+$/, "…");
  }

  const totalHeight = fixedHeight + displayLines.length * summaryLineHeight;
  let y = availableTop + (availableHeight - totalHeight) / 2;

  ctx.font = "400 13px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  y += labelHeight / 2;
  ctx.fillText("CONTINUE READING", w / 2, y);
  y += labelHeight / 2 + labelToTitle;

  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "rgba(245, 238, 216, 0.7)";
  ctx.letterSpacing = "0px";
  ctx.textAlign = "center";
  for (const line of titleLines) {
    y += titleLineHeight / 2;
    ctx.fillText(line, w / 2, y);
    y += titleLineHeight / 2;
  }

  y += titleToDivider;
  drawGoldDivider(ctx, w / 2, y, 40);
  y += dividerHeight + dividerToSummary;

  ctx.font = `300 ${summaryFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of displayLines) {
    y += summaryLineHeight / 2;
    ctx.fillText(line, w / 2, y);
    y += summaryLineHeight / 2;
  }

  drawBottomBar(ctx, w, h, padding, bottomBarHeight, "SELENARIUM", "Read more on mihaigavrilescu.ro", logoImg);
}

export function EssayActionBarNew({
  essayId,
  title,
  excerpt,
  body,
  category = "",
  readTime = "",
  bgImage,
  saved = false,
}: EssayActionBarProps) {
  const [generatingImage, setGeneratingImage] = useState<{
    platform: ImagePlatform;
    format: ImageFormat;
  } | null>(null);
  const [cachedSummary, setCachedSummary] = useState<string | null>(null);

  const getSummary = useCallback(async (): Promise<string> => {
    if (cachedSummary) return cachedSummary;
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: body, contentType: "essay", style: "instagram" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const summary = data.summary || excerpt;
      setCachedSummary(summary);
      return summary;
    } catch {
      setCachedSummary(excerpt);
      return excerpt;
    }
  }, [body, excerpt, cachedSummary]);

  const handleGenerateImage = useCallback(
    async (platform: ImagePlatform, format: ImageFormat) => {
      setGeneratingImage({ platform, format });
      try {
        const [, bgImg, logoImg, summary] = await Promise.all([
          ensureFontsLoaded(),
          bgImage ? loadImage(bgImage).catch(() => null) : Promise.resolve(null),
          loadImage("/logo.png").catch(() => null),
          getSummary(),
        ]);

        const slug = slugify(title);
        const prefix = platform === "tiktok" ? "tt" : "ig";

        // Slide 1: Title card
        const canvas1 = document.createElement("canvas");
        renderEssayImage(canvas1, bgImg, logoImg, title, excerpt, category, readTime, format);
        const blob1 = await canvasToBlob(canvas1);
        downloadBlob(blob1, `${slug}-${prefix}-${format}-1-title.png`);

        // Slide 2: Summary card
        const canvas2 = document.createElement("canvas");
        renderSummarySlide(canvas2, bgImg, logoImg, title, summary, format);
        const blob2 = await canvasToBlob(canvas2);
        await new Promise((r) => setTimeout(r, 500));
        downloadBlob(blob2, `${slug}-${prefix}-${format}-2-summary.png`);
      } catch (err) {
        console.error("Image generation failed:", err);
      } finally {
        setGeneratingImage(null);
      }
    },
    [title, excerpt, body, category, readTime, bgImage, getSummary],
  );

  return (
    <ContentActionBar
      contentId={essayId}
      contentType="ESSAY"
      title={title}
      saved={saved}
      onGenerateImage={handleGenerateImage}
      generatingImage={generatingImage}
    />
  );
}
