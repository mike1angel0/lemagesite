// Shared utilities for canvas-based image generation (IG + TikTok)

export type Format = "square" | "story";

export const FORMATS: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Load an external image safely for canvas use by fetching it as a blob first.
 * This avoids CORS canvas-tainting issues with cross-origin images (e.g. Cloudinary).
 */
export async function loadImageSafe(src: string): Promise<HTMLImageElement> {
  const response = await fetch(src);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImage(objectUrl);
  } finally {
    // Clean up after a short delay to ensure the image is fully drawn
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  }
}

export async function loadFont(
  url: string,
  family: string,
  weight: string,
): Promise<void> {
  const font = new FontFace(family, `url(${url})`, {
    weight,
    style: "normal",
  });
  await font.load();
  document.fonts.add(font);
}

let fontsLoaded = false;

export async function ensureFontsLoaded() {
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

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
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

export function downloadBlob(blob: Blob, filename: string) {
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

export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawInsetBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
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

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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

export function drawCoverFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;
  if (imgRatio > canvasRatio) {
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / canvasRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

export function drawGoldDivider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfWidth: number,
) {
  ctx.fillStyle = "#C9A96E";
  ctx.fillRect(x - halfWidth, y, halfWidth * 2, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
}

export function drawBottomBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  padding: number,
  bottomBarHeight: number,
  brandLabel: string,
  sectionLabel: string,
  logoImg: HTMLImageElement | null,
) {
  const bottomY = h - bottomBarHeight / 2;
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(brandLabel, padding, bottomY);

  ctx.font = "400 12px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(245, 238, 216, 0.4)";
  ctx.letterSpacing = "1px";
  ctx.fillText(sectionLabel, padding, bottomY + 22);

  if (logoImg) {
    const logoSize = 120;
    const logoX = w - 40 - logoSize;
    const logoY = bottomY - logoSize / 2;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.globalAlpha = 1;
  }
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
