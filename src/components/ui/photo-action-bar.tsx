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
  drawGoldDivider,
  drawBottomBar,
  wrapText,
  slugify,
} from "./image-gen-utils";

interface PhotoActionBarProps {
  photoId: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  saved?: boolean;
  prevSlug?: string | null;
  nextSlug?: string | null;
  prevLabel?: string;
  nextLabel?: string;
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

function renderPhotoImage(
  canvas: HTMLCanvasElement,
  photoImg: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  title: string,
  description: string | null,
  format: "square" | "story",
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

  // ── Photo as featured element ──
  const imgPadding = 56;
  const imgX = imgPadding;
  const imgW = w - imgPadding * 2;
  // For story: large image area; for square: proportional
  const imgH = isStory ? 1050 : 640;
  const imgY = isStory ? 80 : 60;
  const radius = 12;

  // Draw rounded image
  ctx.save();
  drawRoundedRect(ctx, imgX, imgY, imgW, imgH, radius);
  ctx.clip();

  // Cover-fit the photo into the rounded rect
  const imgRatio = photoImg.width / photoImg.height;
  const rectRatio = imgW / imgH;
  let sx = 0, sy = 0, sw = photoImg.width, sh = photoImg.height;
  if (imgRatio > rectRatio) {
    sw = photoImg.height * rectRatio;
    sx = (photoImg.width - sw) / 2;
  } else {
    sh = photoImg.width / rectRatio;
    sy = (photoImg.height - sh) / 2;
  }
  ctx.drawImage(photoImg, sx, sy, sw, sh, imgX, imgY, imgW, imgH);

  ctx.restore();

  // Subtle gold border around image
  ctx.save();
  drawRoundedRect(ctx, imgX, imgY, imgW, imgH, radius);
  ctx.strokeStyle = "rgba(201, 169, 110, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // ── Title below image ──
  const titleY = imgY + imgH + (isStory ? 48 : 36);
  const titleSize = isStory ? 44 : 38;
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Wrap title if needed
  const titleLines = wrapText(ctx, title, contentWidth);
  const titleLineHeight = titleSize * 1.4;
  let currentTitleY = titleY;
  for (const line of titleLines) {
    ctx.fillText(line, w / 2, currentTitleY);
    currentTitleY += titleLineHeight;
  }

  // Gold divider
  const dividerY = currentTitleY + (isStory ? 12 : 8);
  drawGoldDivider(ctx, w / 2, dividerY, 60);

  // ── Description (if provided and there's room) ──
  if (description) {
    const descY = dividerY + (isStory ? 32 : 24);
    const descSize = isStory ? 22 : 19;
    ctx.font = `400 ${descSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "rgba(245, 238, 216, 0.65)";
    ctx.textAlign = "center";

    const bottomBarHeight = isStory ? 180 : 140;
    const maxDescY = h - bottomBarHeight - 20;
    const descLineHeight = descSize * 1.6;
    const descLines = wrapText(ctx, description, contentWidth - 40);
    // Only show as many lines as fit
    const maxLines = Math.floor((maxDescY - descY) / descLineHeight);
    const linesToShow = descLines.slice(0, Math.min(descLines.length, maxLines));

    let currentDescY = descY;
    for (const line of linesToShow) {
      ctx.fillText(line, w / 2, currentDescY);
      currentDescY += descLineHeight;
    }
  }

  // ── Bottom bar ──
  const bottomBarHeight = isStory ? 180 : 140;
  drawBottomBar(
    ctx, w, h, padding, bottomBarHeight,
    "LEMAGEPOET",
    "Photography",
    logoImg,
  );
}

function renderPhotoCtaPage(
  canvas: HTMLCanvasElement,
  logoImg: HTMLImageElement | null,
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
  ctx.fillText("Selenarium  ·  Photography", w / 2, centerY + (isStory ? 150 : 118));

  // ── Bottom bar ──
  const bottomBarHeight = isStory ? 180 : 140;
  drawBottomBar(ctx, w, h, 80, bottomBarHeight, "LEMAGEPOET", "Photography", logoImg);
}

export function PhotoActionBar({
  photoId,
  title,
  description,
  imageUrl,
  saved = false,
  prevSlug,
  nextSlug,
  prevLabel = "Previous",
  nextLabel = "Next",
}: PhotoActionBarProps) {
  const [generatingImage, setGeneratingImage] = useState<{
    platform: ImagePlatform;
    format: ImageFormat;
  } | null>(null);

  const handleGenerateImage = useCallback(
    async (platform: ImagePlatform, format: ImageFormat) => {
      setGeneratingImage({ platform, format });
      try {
        await ensureFontsLoaded();

        const [photoImg, logoImg] = await Promise.all([
          loadImageSafe(imageUrl).catch(() => null),
          loadImage("/logo.png").catch(() => null),
        ]);

        if (!photoImg) {
          console.error("Failed to load photo image");
          return;
        }

        const canvas = document.createElement("canvas");
        const slug = slugify(title);
        const prefix = platform === "tiktok" ? "tt" : "ig";

        // Render main photo image
        renderPhotoImage(canvas, photoImg, logoImg, title, description || null, format);
        const mainBlob = await canvasToBlob(canvas);

        // Render CTA page
        renderPhotoCtaPage(canvas, logoImg, format);
        const ctaBlob = await canvasToBlob(canvas);

        // Download both
        downloadBlob(mainBlob, `${slug}-${prefix}-${format}-1.png`);
        await new Promise((r) => setTimeout(r, 500));
        downloadBlob(ctaBlob, `${slug}-${prefix}-${format}-2.png`);
      } catch (err) {
        console.error("Image generation failed:", err);
      } finally {
        setGeneratingImage(null);
      }
    },
    [title, description, imageUrl],
  );

  return (
    <ContentActionBar
      contentId={photoId}
      contentType="PHOTO"
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
