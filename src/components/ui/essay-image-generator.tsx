"use client";

import { useState } from "react";

interface EssayImageGeneratorProps {
  title: string;
  excerpt: string;
  category?: string;
  readTime?: string;
  bgImage?: string;
}

type Format = "square" | "story";

const FORMATS: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadFont(url: string, family: string, weight: string): Promise<void> {
  const font = new FontFace(family, `url(${url})`, {
    weight,
    style: "normal",
  });
  await font.load();
  document.fonts.add(font);
}

let fontsLoaded = false;

async function ensureFontsLoaded() {
  if (fontsLoaded) return;
  await Promise.all([
    loadFont(
      "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQWJ5heb_w.ttf",
      "Cormorant Garamond",
      "300",
    ),
    loadFont(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      "Inter",
      "400",
    ),
  ]);
  fontsLoaded = true;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/png",
    );
  });
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawInsetBorder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const inset = 32;
  ctx.strokeStyle = "rgba(201, 169, 110, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  const corner = 12;
  ctx.strokeStyle = "rgba(201, 169, 110, 0.5)";
  ctx.lineWidth = 1.5;
  const positions = [
    [inset, inset, 1, 1],
    [width - inset, inset, -1, 1],
    [inset, height - inset, 1, -1],
    [width - inset, height - inset, -1, -1],
  ] as const;
  for (const [x, y, dx, dy] of positions) {
    ctx.beginPath();
    ctx.moveTo(x + corner * dx, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + corner * dy);
    ctx.stroke();
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function renderEssayImage(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  excerpt: string,
  category: string,
  readTime: string,
  format: Format,
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  const width = w * scale;
  const height = h * scale;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Solid dark fallback — warm charcoal
  ctx.fillStyle = "#1A150E";
  ctx.fillRect(0, 0, w, h);

  // Background photo (cover-fit)
  if (bgImg) {
    const imgRatio = bgImg.width / bgImg.height;
    const canvasRatio = w / h;
    let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
    if (imgRatio > canvasRatio) {
      sw = bgImg.height * canvasRatio;
      sx = (bgImg.width - sw) / 2;
    } else {
      sh = bgImg.width / canvasRatio;
      sy = (bgImg.height - sh) / 2;
    }
    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h);
  }

  // Dark overlay — warm tinted
  ctx.fillStyle = "rgba(26, 21, 14, 0.78)";
  ctx.fillRect(0, 0, w, h);
  drawVignette(ctx, w, h);
  drawInsetBorder(ctx, w, h);

  const padding = 80;
  const contentWidth = w - padding * 2;
  const isStory = format === "story";
  const bottomBarHeight = isStory ? 220 : 180;

  // ── Measure all content to center vertically ──
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
  const metaHeight = (category || readTime) ? 13 : 0;

  const dividerGap = isStory ? 28 : 24;
  const dividerHeight = 1;

  const excerptGap = isStory ? 28 : 24;
  const excerptFontSize = isStory ? 22 : 20;
  const excerptLineHeight = excerptFontSize * 1.7;
  ctx.font = `300 ${excerptFontSize}px "Cormorant Garamond", Georgia, serif`;
  const excerptLines = wrapText(ctx, excerpt, contentWidth - 20);

  // Calculate total content height and available space
  const availableTop = padding + 32;
  const availableBottom = h - bottomBarHeight;
  const availableHeight = availableBottom - availableTop;

  const fixedHeight = labelHeight + labelGap + titleBlockHeight + authorGap + authorHeight
    + (metaHeight ? metaGap + metaHeight : 0) + dividerGap + dividerHeight + excerptGap;

  const excerptAvailable = availableHeight - fixedHeight;
  const maxExcerptLines = Math.max(1, Math.floor(excerptAvailable / excerptLineHeight));
  const displayLines = excerptLines.slice(0, maxExcerptLines);
  if (excerptLines.length > maxExcerptLines && displayLines.length > 0) {
    displayLines[displayLines.length - 1] = displayLines[displayLines.length - 1].replace(/\s*\S+$/, "…");
  }

  const totalHeight = fixedHeight + displayLines.length * excerptLineHeight;
  let y = availableTop + (availableHeight - totalHeight) / 2;

  // ── "ESSAY" label ──
  ctx.font = '400 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  y += labelHeight / 2;
  ctx.fillText("ESSAY", w / 2, y);
  y += labelHeight / 2 + labelGap;

  // ── Title ──
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of titleLines) {
    y += titleLineHeight / 2;
    ctx.fillText(line, w / 2, y);
    y += titleLineHeight / 2;
  }

  // ── Author name ──
  y += authorGap;
  ctx.font = '400 16px Inter, system-ui, sans-serif';
  ctx.fillStyle = "rgba(245, 238, 216, 0.6)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";
  ctx.fillText("Mihai Gavrilescu, PhD", w / 2, y + authorHeight / 2);
  y += authorHeight;

  // ── Category & Read Time ──
  if (category || readTime) {
    y += metaGap;
    ctx.font = '400 13px Inter, system-ui, sans-serif';
    ctx.fillStyle = "rgba(245, 238, 216, 0.4)";
    ctx.letterSpacing = "1px";
    const metaText = [category, readTime].filter(Boolean).join("  ·  ");
    ctx.fillText(metaText, w / 2, y + metaHeight / 2);
    y += metaHeight;
  }

  // ── Gold divider ──
  y += dividerGap;
  const dividerW = 60;
  ctx.fillStyle = "#C9A96E";
  ctx.fillRect(w / 2 - dividerW, y, dividerW * 2, 1);
  ctx.save();
  ctx.translate(w / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
  y += dividerHeight + excerptGap;

  // ── Excerpt ──
  ctx.font = `300 ${excerptFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "rgba(245, 238, 216, 0.85)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of displayLines) {
    y += excerptLineHeight / 2;
    ctx.fillText(line, w / 2, y, contentWidth);
    y += excerptLineHeight / 2;
  }

  // ── Bottom bar ──
  const bottomY = h - bottomBarHeight / 2;
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("SELENARIUM", padding, bottomY);

  ctx.font = "400 12px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(245, 238, 216, 0.4)";
  ctx.letterSpacing = "1px";
  ctx.fillText("Essays", padding, bottomY + 22);

  // Logo bottom-right
  if (logoImg) {
    const logoSize = 120;
    const logoX = w - 40 - logoSize;
    const logoY = bottomY - logoSize / 2;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.globalAlpha = 1;
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function EssayImageGenerator({
  title,
  excerpt,
  category = "",
  readTime = "",
  bgImage,
}: EssayImageGeneratorProps) {
  const [loading, setLoading] = useState<Format | null>(null);

  async function generateImage(format: Format) {
    setLoading(format);
    try {
      await ensureFontsLoaded();

      const [bgImg, logoImg] = await Promise.all([
        bgImage ? loadImage(bgImage).catch(() => null) : Promise.resolve(null),
        loadImage("/logo.png").catch(() => null),
      ]);

      const canvas = document.createElement("canvas");
      renderEssayImage(canvas, bgImg, logoImg, title, excerpt, category, readTime, format);

      const blob = await canvasToBlob(canvas);
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      downloadBlob(blob, `${slug}-${format}.png`);
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
        Image
      </span>
      <button
        type="button"
        onClick={() => generateImage("square")}
        disabled={loading !== null}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {loading === "square" ? "Generating…" : "IG Post"}
      </button>
      <button
        type="button"
        onClick={() => generateImage("story")}
        disabled={loading !== null}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {loading === "story" ? "Generating…" : "IG Story"}
      </button>
    </div>
  );
}
