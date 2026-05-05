"use client";

import { useState } from "react";

interface PoemImageGeneratorProps {
  title: string;
  stanzas: string[];
  bgImage: string;
}

type Format = "square" | "story";

const FORMATS: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

const STANZAS_PER_PAGE: Record<Format, number> = {
  square: 2,
  story: 4,
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

async function loadFont(url: string): Promise<void> {
  const font = new FontFace("Cormorant Garamond", `url(${url})`, {
    weight: "300",
    style: "normal",
  });
  await font.load();
  document.fonts.add(font);
}

let fontLoaded = false;

async function ensureFontLoaded() {
  if (fontLoaded) return;
  await loadFont(
    "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQWJ5heb_w.ttf",
  );
  fontLoaded = true;
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

function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawInsetBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const inset = 32;
  ctx.strokeStyle = "rgba(201, 169, 110, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  // Corner accents
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

function renderPoemImage(
  canvas: HTMLCanvasElement,
  bgImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  title: string,
  pageStanzas: string[],
  format: Format,
  currentPage: number,
  totalPages: number,
) {
  const scale = 3;
  const { width: w, height: h } = FORMATS[format];
  const width = w * scale;
  const height = h * scale;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // All drawing uses logical coordinates (w x h), ctx.scale handles 2x
  // Solid dark fallback
  ctx.fillStyle = "#0A0806";
  ctx.fillRect(0, 0, w, h);

  // Background photo (cover-fit)
  if (bgImg) {
    const imgRatio = bgImg.width / bgImg.height;
    const canvasRatio = w / h;
    let sx = 0,
      sy = 0,
      sw = bgImg.width,
      sh = bgImg.height;
    if (imgRatio > canvasRatio) {
      sw = bgImg.height * canvasRatio;
      sx = (bgImg.width - sw) / 2;
    } else {
      sh = bgImg.width / canvasRatio;
      sy = (bgImg.height - sh) / 2;
    }
    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h);
  }

  // Dark overlay
  ctx.fillStyle = "rgba(10, 8, 6, 0.72)";
  ctx.fillRect(0, 0, w, h);

  // Vignette for depth
  drawVignette(ctx, w, h);

  // Decorative inset border
  drawInsetBorder(ctx, w, h);

  const padding = 80;
  const contentWidth = w - padding * 2;
  const isStory = format === "story";

  // ── Title ──
  const titleSize = isStory ? 78 : 68;
  ctx.font = `300 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#F5EED8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const titleY = isStory ? 200 : 150;
  ctx.fillText(title, w / 2, titleY, contentWidth);

  // ── Gold divider with diamond ──
  const dividerY = titleY + 48;
  const dividerW = 60;
  ctx.fillStyle = "#C9A96E";
  ctx.fillRect(w / 2 - dividerW, dividerY, dividerW * 2, 1);
  // Diamond accent
  ctx.save();
  ctx.translate(w / 2, dividerY);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();

  // ── Stanzas ──
  const fontSize = isStory ? 48 : 42;
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
    if (i < stanzaLines.length - 1) {
      y += stanzaGap;
    }
  }

  // ── Bottom bar: author (left-center) + logo (right) ──
  const bottomY = h - bottomBarHeight / 2;

  // Author credit
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const authorX = padding;
  ctx.fillText("LEMAGEPOET", authorX, bottomY);

  // Page indicator below author
  if (totalPages > 1) {
    ctx.font = "400 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(245, 238, 216, 0.4)";
    ctx.letterSpacing = "1px";
    ctx.fillText(
      `${currentPage + 1} / ${totalPages}`,
      authorX,
      bottomY + 22,
    );
  }

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

export function PoemImageGenerator({
  title,
  stanzas,
  bgImage,
}: PoemImageGeneratorProps) {
  const [loading, setLoading] = useState<Format | null>(null);

  async function generateImages(format: Format) {
    setLoading(format);
    try {
      await ensureFontLoaded();

      const perPage = STANZAS_PER_PAGE[format];
      const totalPages = Math.max(1, Math.ceil(stanzas.length / perPage));

      // Load background image and logo in parallel
      const [bgImg, logoImg] = await Promise.all([
        bgImage ? loadImage(bgImage).catch(() => null) : Promise.resolve(null),
        loadImage("/logo.png").catch(() => null),
      ]);

      const canvas = document.createElement("canvas");
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Generate all blobs first, then download them
      const blobs: { blob: Blob; filename: string }[] = [];
      for (let page = 0; page < totalPages; page++) {
        const pageStanzas = stanzas.slice(
          page * perPage,
          (page + 1) * perPage,
        );
        renderPoemImage(
          canvas,
          bgImg,
          logoImg,
          title,
          pageStanzas,
          format,
          page,
          totalPages,
        );

        const blob = await canvasToBlob(canvas);
        const suffix = totalPages > 1 ? `-${page + 1}` : "";
        blobs.push({ blob, filename: `${slug}-${format}${suffix}.png` });
      }

      // Download all — use staggered timing so browser doesn't block them
      for (let i = 0; i < blobs.length; i++) {
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        downloadBlob(blobs[i].blob, blobs[i].filename);
      }
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
        onClick={() => generateImages("square")}
        disabled={loading !== null}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {loading === "square" ? "Generating…" : "IG Post"}
      </button>
      <button
        type="button"
        onClick={() => generateImages("story")}
        disabled={loading !== null}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {loading === "story" ? "Generating…" : "IG Story"}
      </button>
    </div>
  );
}
