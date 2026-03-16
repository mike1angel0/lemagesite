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

interface ResearchActionBarProps {
  paperId: string;
  title: string;
  abstract: string;
  year?: string;
  bgImage?: string;
  saved?: boolean;
}

function renderResearchImage(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  abstract: string,
  year: string,
  format: "square" | "story",
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.fillStyle = "#0B1120";
  ctx.fillRect(0, 0, w, h);
  if (bgImg) drawCoverFit(ctx, bgImg, w, h);

  ctx.fillStyle = "rgba(11, 17, 32, 0.78)";
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
  const titleLines = wrapText(ctx, title, contentWidth);
  const titleLineHeight = titleSize * 1.3;
  const titleBlockHeight = titleLines.length * titleLineHeight;

  const authorGap = isStory ? 24 : 20;
  const authorHeight = 16;
  const yearGap = 8;
  const yearHeight = year ? 13 : 0;
  const dividerGap = isStory ? 28 : 24;
  const dividerHeight = 1;
  const abstractGap = isStory ? 28 : 24;
  const abstractFontSize = isStory ? 22 : 20;
  const abstractLineHeight = abstractFontSize * 1.7;
  ctx.font = `300 ${abstractFontSize}px "Cormorant Garamond", Georgia, serif`;
  const abstractLines = wrapText(ctx, abstract, contentWidth - 20);

  const availableTop = padding + 32;
  const availableBottom = h - bottomBarHeight;
  const availableHeight = availableBottom - availableTop;

  const fixedHeight =
    labelHeight + labelGap + titleBlockHeight + authorGap + authorHeight +
    (yearHeight ? yearGap + yearHeight : 0) + dividerGap + dividerHeight + abstractGap;

  const abstractAvailable = availableHeight - fixedHeight;
  const maxAbstractLines = Math.max(1, Math.floor(abstractAvailable / abstractLineHeight));
  const displayLines = abstractLines.slice(0, maxAbstractLines);
  if (abstractLines.length > maxAbstractLines && displayLines.length > 0) {
    displayLines[displayLines.length - 1] = displayLines[displayLines.length - 1].replace(/\s*\S+$/, "…");
  }

  const totalHeight = fixedHeight + displayLines.length * abstractLineHeight;
  let y = availableTop + (availableHeight - totalHeight) / 2;

  ctx.font = "400 13px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  y += labelHeight / 2;
  ctx.fillText("RESEARCH PAPER", w / 2, y);
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

  if (year) {
    y += yearGap;
    ctx.font = "400 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(245, 238, 216, 0.4)";
    ctx.letterSpacing = "1px";
    ctx.fillText(year, w / 2, y + yearHeight / 2);
    y += yearHeight;
  }

  y += dividerGap;
  drawGoldDivider(ctx, w / 2, y, 60);
  y += dividerHeight + abstractGap;

  ctx.font = `300 ${abstractFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "rgba(245, 238, 216, 0.85)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of displayLines) {
    y += abstractLineHeight / 2;
    ctx.fillText(line, w / 2, y, contentWidth);
    y += abstractLineHeight / 2;
  }

  drawBottomBar(ctx, w, h, padding, bottomBarHeight, "SELENARIUM", "Research", logoImg);
}

export function ResearchActionBar({
  paperId,
  title,
  abstract,
  year = "",
  bgImage,
  saved = false,
}: ResearchActionBarProps) {
  const [generatingImage, setGeneratingImage] = useState<{
    platform: ImagePlatform;
    format: ImageFormat;
  } | null>(null);

  const handleGenerateImage = useCallback(
    async (platform: ImagePlatform, format: ImageFormat) => {
      setGeneratingImage({ platform, format });
      try {
        await ensureFontsLoaded();
        const [bgImg, logoImg] = await Promise.all([
          bgImage ? loadImage(bgImage).catch(() => null) : Promise.resolve(null),
          loadImage("/logo.png").catch(() => null),
        ]);

        const canvas = document.createElement("canvas");
        renderResearchImage(canvas, bgImg, logoImg, title, abstract, year, format);

        const blob = await canvasToBlob(canvas);
        const slug = slugify(title);
        const prefix = platform === "tiktok" ? "tt" : "ig";
        downloadBlob(blob, `${slug}-${prefix}-${format}.png`);
      } catch (err) {
        console.error("Image generation failed:", err);
      } finally {
        setGeneratingImage(null);
      }
    },
    [title, abstract, year, bgImage],
  );

  return (
    <ContentActionBar
      contentId={paperId}
      contentType="RESEARCH"
      title={title}
      saved={saved}
      onGenerateImage={handleGenerateImage}
      generatingImage={generatingImage}
    />
  );
}
