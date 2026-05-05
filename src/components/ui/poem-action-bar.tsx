"use client";

import { useState, useCallback } from "react";
import { ContentActionBar } from "./content-action-bar";
import type { ImageFormat, ImagePlatform } from "./share-sheet";
import {
  FORMATS,
  ensureFontsLoaded,
  loadImage,
  loadImageSafe,
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
  coverImage?: string | null;
  saved?: boolean;
  prevSlug?: string | null;
  nextSlug?: string | null;
  prevLabel?: string;
  nextLabel?: string;
}

// Max content lines per page (not counting blank separator lines)
const MAX_LINES_PER_PAGE: Record<"square" | "story", number> = {
  square: 14,
  story: 24,
};

/**
 * Paginate poem content for image generation.
 * 1. Re-split the body into stanzas using blank lines (handles \r\n, whitespace lines)
 * 2. Place stanzas onto pages, breaking at stanza boundaries
 * 3. If a single stanza exceeds the line limit, split it mid-stanza
 */
function paginateStanzas(inputStanzas: string[], format: "square" | "story"): string[][] {
  const maxLines = MAX_LINES_PER_PAGE[format];

  // Re-normalize: join everything back and re-split by blank lines
  // This handles cases where the original split didn't catch all separators
  const fullText = inputStanzas.join("\n\n");
  const stanzas = fullText.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);

  const pages: string[][] = [];
  let currentPageStanzas: string[] = [];
  let currentLineCount = 0;

  for (const stanza of stanzas) {
    const lineCount = stanza.split("\n").length;

    // If this single stanza is too long, split it into line chunks
    if (lineCount > maxLines) {
      // First flush current page
      if (currentPageStanzas.length > 0) {
        pages.push(currentPageStanzas);
        currentPageStanzas = [];
        currentLineCount = 0;
      }
      // Split long stanza by lines
      const lines = stanza.split("\n");
      for (let i = 0; i < lines.length; i += maxLines) {
        pages.push([lines.slice(i, i + maxLines).join("\n")]);
      }
      continue;
    }

    // Would adding this stanza exceed the page limit?
    if (currentPageStanzas.length > 0 && currentLineCount + lineCount > maxLines) {
      pages.push(currentPageStanzas);
      currentPageStanzas = [];
      currentLineCount = 0;
    }

    currentPageStanzas.push(stanza);
    currentLineCount += lineCount;
  }

  if (currentPageStanzas.length > 0) {
    pages.push(currentPageStanzas);
  }

  return pages.length > 0 ? pages : [inputStanzas];
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderPoemImage(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  coverImg: HTMLImageElement | null,
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

  const isStory = format === "story";
  const padding = 80;
  const contentWidth = w - padding * 2;

  // ── Dark background ──
  ctx.fillStyle = "#0A0806";
  ctx.fillRect(0, 0, w, h);

  // Subtle texture via vignette
  drawVignette(ctx, w, h);

  // Decorative inset border
  drawInsetBorder(ctx, w, h);

  let contentStartY: number;

  if (currentPage === 0) {
    // ── Page 1: full header with cover image or title ──
    if (coverImg) {
      // ── Cover image as featured element ──
      const imgPadding = 56;
      const imgX = imgPadding;
      const imgW = w - imgPadding * 2;
      const imgH = isStory ? 520 : 380;
      const imgY = isStory ? 80 : 60;
      const radius = 12;

      // Draw rounded image
      ctx.save();
      drawRoundedRect(ctx, imgX, imgY, imgW, imgH, radius);
      ctx.clip();

      // Cover-fit the image into the rounded rect
      const imgRatio = coverImg.width / coverImg.height;
      const rectRatio = imgW / imgH;
      let sx = 0, sy = 0, sw = coverImg.width, sh = coverImg.height;
      if (imgRatio > rectRatio) {
        sw = coverImg.height * rectRatio;
        sx = (coverImg.width - sw) / 2;
      } else {
        sh = coverImg.width / rectRatio;
        sy = (coverImg.height - sh) / 2;
      }
      ctx.drawImage(coverImg, sx, sy, sw, sh, imgX, imgY, imgW, imgH);

      // Gradient overlay on bottom half of image for title readability
      const gradient = ctx.createLinearGradient(imgX, imgY + imgH * 0.4, imgX, imgY + imgH);
      gradient.addColorStop(0, "rgba(10, 8, 6, 0)");
      gradient.addColorStop(1, "rgba(10, 8, 6, 0.85)");
      ctx.fillStyle = gradient;
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.restore();

      // Subtle gold border around image
      ctx.save();
      drawRoundedRect(ctx, imgX, imgY, imgW, imgH, radius);
      ctx.strokeStyle = "rgba(201, 169, 110, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── Title overlaid on bottom of image ──
      const titleSize = isStory ? 60 : 54;
      ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillStyle = "#F5EED8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const titleY = imgY + imgH - 36;
      ctx.fillText(title, w / 2, titleY, imgW - 40);

      // Gold divider below image
      const dividerY = imgY + imgH + 28;
      drawGoldDivider(ctx, w / 2, dividerY, 60);

      contentStartY = dividerY + 36;
    } else {
      // ── No cover image: title at top (original layout) ──
      const titleSize = isStory ? 66 : 58;
      ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillStyle = "#F5EED8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const titleY = isStory ? 200 : 150;
      ctx.fillText(title, w / 2, titleY, contentWidth);

      const dividerY = titleY + 48;
      drawGoldDivider(ctx, w / 2, dividerY, 60);

      contentStartY = dividerY + 40;
    }
  } else {
    // ── Pages 2+: no header, just start content with some top padding ──
    contentStartY = isStory ? 100 : 80;
  }

  // ── Stanzas ──
  const fontSize = isStory ? 42 : 38;
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

  const bottomBarHeight = isStory ? 180 : 140;
  const textAreaBottom = h - bottomBarHeight;
  const textAreaHeight = textAreaBottom - contentStartY;

  // If text overflows the available area, shrink font to fit
  let actualFontSize = fontSize;
  let actualLineHeight = lineHeight;
  let actualStanzaGap = stanzaGap;
  if (totalTextHeight > textAreaHeight && textAreaHeight > 0) {
    const scale = textAreaHeight / totalTextHeight;
    actualFontSize = Math.max(18, Math.floor(fontSize * scale));
    actualLineHeight = actualFontSize * 1.75;
    actualStanzaGap = Math.max(16, Math.floor(stanzaGap * scale));
    ctx.font = `300 ${actualFontSize}px "Cormorant Garamond", Georgia, serif`;
    // Recalculate total height with scaled values
    totalTextHeight = 0;
    for (const lines of stanzaLines) {
      totalTextHeight += lines.length * actualLineHeight;
    }
    totalTextHeight += (stanzaLines.length - 1) * actualStanzaGap;
  }

  // Clamp y so text never overlaps the title area
  let y = contentStartY + Math.max(0, (textAreaHeight - totalTextHeight) / 2) + actualFontSize / 2;

  for (let i = 0; i < stanzaLines.length; i++) {
    for (const line of stanzaLines[i]) {
      ctx.fillText(line, w / 2, y, contentWidth);
      y += actualLineHeight;
    }
    if (i < stanzaLines.length - 1) y += actualStanzaGap;
  }

  // ── Bottom bar ──
  drawBottomBar(
    ctx, w, h, padding, bottomBarHeight,
    "LEMAGEPOET",
    totalPages > 1 ? `${currentPage + 1} / ${totalPages}` : "Poetry",
    logoImg,
  );
}

function renderCtaPage(
  canvas: HTMLCanvasElement,
  logoImg: HTMLImageElement | null,
  title: string,
  format: "square" | "story",
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const isStory = format === "story";

  // ── Dark background ──
  ctx.fillStyle = "#0A0806";
  ctx.fillRect(0, 0, w, h);
  drawVignette(ctx, w, h);
  drawInsetBorder(ctx, w, h);

  const centerY = h / 2;

  // ── Logo ──
  if (logoImg) {
    const logoSize = isStory ? 160 : 120;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(logoImg, (w - logoSize) / 2, centerY - logoSize - (isStory ? 100 : 70), logoSize, logoSize);
    ctx.globalAlpha = 1;
  }

  // ── Gold divider ──
  drawGoldDivider(ctx, w / 2, centerY - (isStory ? 50 : 36), 60);

  // ── "Follow for more" ──
  const followSize = isStory ? 46 : 38;
  ctx.font = `300 ${followSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Follow for more", w / 2, centerY + (isStory ? 10 : 8));

  // ── Gold divider ──
  drawGoldDivider(ctx, w / 2, centerY + (isStory ? 60 : 46), 40);

  // ── Website URL ──
  const urlSize = isStory ? 28 : 24;
  ctx.font = `400 ${urlSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#C9A96E";
  ctx.letterSpacing = "2px";
  ctx.fillText("mihaigavrilescu.ro", w / 2, centerY + (isStory ? 110 : 86));
  ctx.letterSpacing = "0px";

  // ── Subtitle ──
  const subSize = isStory ? 20 : 17;
  ctx.font = `400 ${subSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(245, 238, 216, 0.45)";
  ctx.fillText("Selenarium  ·  Poetry & Essays", w / 2, centerY + (isStory ? 150 : 118));

  // ── Bottom bar ──
  const bottomBarHeight = isStory ? 180 : 140;
  drawBottomBar(ctx, w, h, 80, bottomBarHeight, "LEMAGEPOET", "Poetry", logoImg);
}

export function PoemActionBar({
  poemId,
  title,
  stanzas,
  bgImage,
  coverImage,
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
        const pages = paginateStanzas(stanzas, format);
        const totalPages = pages.length;

        const [coverImg, logoImg] = await Promise.all([
          coverImage ? loadImageSafe(coverImage).catch(() => null) : Promise.resolve(null),
          loadImage("/logo.png").catch(() => null),
        ]);

        const canvas = document.createElement("canvas");
        const slug = slugify(title);
        const prefix = platform === "tiktok" ? "tt" : "ig";

        const totalWithCta = totalPages + 1; // +1 for CTA page
        const blobs: { blob: Blob; filename: string }[] = [];
        for (let page = 0; page < totalPages; page++) {
          const pageStanzas = pages[page];
          renderPoemImage(canvas, null, coverImg, logoImg, title, pageStanzas, format, page, totalPages);
          const blob = await canvasToBlob(canvas);
          blobs.push({ blob, filename: `${slug}-${prefix}-${format}-${page + 1}.png` });
        }
        // Final CTA page
        renderCtaPage(canvas, logoImg, title, format);
        const ctaBlob = await canvasToBlob(canvas);
        blobs.push({ blob: ctaBlob, filename: `${slug}-${prefix}-${format}-${totalWithCta}.png` });

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
    [title, stanzas, coverImage],
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
