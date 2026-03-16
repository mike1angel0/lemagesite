"use client";

import { useState } from "react";

interface EssayImageGeneratorProps {
  title: string;
  excerpt: string;
  body: string;
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

function renderSummarySlide(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  summary: string,
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

  // Solid dark background
  ctx.fillStyle = "#1A150E";
  ctx.fillRect(0, 0, w, h);

  // Background photo
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

  // Darker overlay for readability
  ctx.fillStyle = "rgba(26, 21, 14, 0.85)";
  ctx.fillRect(0, 0, w, h);
  drawVignette(ctx, w, h);
  drawInsetBorder(ctx, w, h);

  const padding = 80;
  const contentWidth = w - padding * 2;
  const isStory = format === "story";
  const bottomBarHeight = isStory ? 220 : 180;

  // ── Measure everything first to center vertically ──
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

  // Available vertical space between inset border and bottom bar
  const availableTop = padding + 32;
  const availableBottom = h - bottomBarHeight;
  const availableHeight = availableBottom - availableTop;

  // Fixed heights (everything except summary lines)
  const fixedHeight = labelHeight + labelToTitle + titleBlockHeight + titleToDivider + dividerHeight + dividerToSummary;

  // How many summary lines fit
  const summaryAvailable = availableHeight - fixedHeight;
  const maxLines = Math.max(1, Math.floor(summaryAvailable / summaryLineHeight));
  const displayLines = allSummaryLines.slice(0, maxLines);
  if (allSummaryLines.length > maxLines && displayLines.length > 0) {
    displayLines[displayLines.length - 1] = displayLines[displayLines.length - 1].replace(/\s*\S+$/, "…");
  }

  const summaryBlockHeight = displayLines.length * summaryLineHeight;
  const totalHeight = fixedHeight + summaryBlockHeight;

  // Center the entire content block vertically
  let y = availableTop + (availableHeight - totalHeight) / 2;

  // ── "CONTINUE READING" label ──
  ctx.font = '400 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  y += labelHeight / 2;
  ctx.fillText("CONTINUE READING", w / 2, y);
  y += labelHeight / 2 + labelToTitle;

  // ── Title (smaller) ──
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "rgba(245, 238, 216, 0.7)";
  ctx.letterSpacing = "0px";
  ctx.textAlign = "center";
  for (const line of titleLines) {
    y += titleLineHeight / 2;
    ctx.fillText(line, w / 2, y);
    y += titleLineHeight / 2;
  }

  // ── Gold divider ──
  y += titleToDivider;
  const dividerW = 40;
  ctx.fillStyle = "#C9A96E";
  ctx.fillRect(w / 2 - dividerW, y, dividerW * 2, 1);
  ctx.save();
  ctx.translate(w / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
  y += dividerHeight + dividerToSummary;

  // ── Summary text ──
  ctx.font = `300 ${summaryFontSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  for (const line of displayLines) {
    y += summaryLineHeight / 2;
    ctx.fillText(line, w / 2, y);
    y += summaryLineHeight / 2;
  }

  // ── Bottom bar ──
  const bottomY = h - bottomBarHeight / 2;
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("SELENARIUM", padding, bottomY);

  ctx.font = "400 15px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(245, 238, 216, 0.5)";
  ctx.letterSpacing = "1px";
  ctx.fillText("Read more on mihaigavrilescu.ro", padding, bottomY + 24);

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
  body,
  category = "",
  readTime = "",
  bgImage,
}: EssayImageGeneratorProps) {
  const [loading, setLoading] = useState<Format | null>(null);
  const [cachedSummary, setCachedSummary] = useState<string | null>(null);

  async function getSummary(): Promise<string> {
    if (cachedSummary) return cachedSummary;

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: body,
          contentType: "essay",
          style: "instagram",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const summary = data.summary || excerpt;
      setCachedSummary(summary);
      return summary;
    } catch {
      // Fallback to excerpt
      setCachedSummary(excerpt);
      return excerpt;
    }
  }

  async function generateImage(format: Format) {
    setLoading(format);
    try {
      const [, bgImg, logoImg, summary] = await Promise.all([
        ensureFontsLoaded(),
        bgImage ? loadImage(bgImage).catch(() => null) : Promise.resolve(null),
        loadImage("/logo.png").catch(() => null),
        getSummary(),
      ]);

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Slide 1: Title card
      const canvas1 = document.createElement("canvas");
      renderEssayImage(canvas1, bgImg, logoImg, title, excerpt, category, readTime, format);
      const blob1 = await canvasToBlob(canvas1);
      downloadBlob(blob1, `${slug}-${format}-1-title.png`);

      // Slide 2: Summary card
      const canvas2 = document.createElement("canvas");
      renderSummarySlide(canvas2, bgImg, logoImg, title, summary, format);
      const blob2 = await canvasToBlob(canvas2);
      downloadBlob(blob2, `${slug}-${format}-2-summary.png`);
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
