import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

export const runtime = "nodejs";

const FORMATS = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
} as const;

const STANZAS_PER_PAGE = {
  square: 2,
  story: 4,
} as const;

type Format = keyof typeof FORMATS;

async function loadFonts() {
  const fontsDir = join(process.cwd(), "src/assets/fonts");
  const [cormorantData, interData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Light.ttf")),
    readFile(join(fontsDir, "Inter-Regular.ttf")),
  ]);
  return {
    cormorantData: cormorantData.buffer as ArrayBuffer,
    interData: interData.buffer as ArrayBuffer,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Untitled";
  const format = (searchParams.get("format") ?? "square") as Format;
  const bgImage = searchParams.get("bgImage") ?? "";

  let stanzas: string[];
  try {
    stanzas = JSON.parse(searchParams.get("stanzas") ?? "[]");
  } catch {
    return new Response("Invalid stanzas JSON", { status: 400 });
  }

  if (!(format in FORMATS)) {
    return new Response("Invalid format", { status: 400 });
  }

  // Client sends pre-sliced stanzas for this page to keep request small
  const totalPages = parseInt(searchParams.get("totalPages") ?? "1", 10);
  const currentPage = parseInt(searchParams.get("currentPage") ?? "0", 10);
  const pageStanzas = stanzas;
  const { width, height } = FORMATS[format];

  const { cormorantData, interData } = await loadFonts();

  // Resolve background image: read from public/ dir to avoid self-fetch deadlock
  let resolvedBgImage = "";
  if (bgImage) {
    try {
      // Extract the path portion (strip origin if absolute URL was passed)
      let imgPath = bgImage;
      try {
        const url = new URL(bgImage);
        imgPath = url.pathname;
      } catch {
        // Already a relative path
      }
      const filePath = join(process.cwd(), "public", imgPath);
      const buf = await readFile(filePath);
      const ext = extname(imgPath).replace(".", "").toLowerCase();
      const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
        : ext === "webp" ? "image/webp"
        : "image/png";
      resolvedBgImage = `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      // If file not found, skip background
    }
  }

  const fontSize = format === "square" ? 32 : 36;
  const titleSize = format === "square" ? 52 : 58;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "Cormorant Garamond",
          backgroundColor: "#0F0C08",
        }}
      >
        {/* Background image */}
        {resolvedBgImage && (
          <img
            src={resolvedBgImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 12, 8, 0.75)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: format === "square" ? "80px 80px" : "120px 80px",
            width: "100%",
            height: "100%",
            position: "relative",
            gap: format === "square" ? "32px" : "40px",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: titleSize,
              color: "#F5EED8",
              textAlign: "center",
              lineHeight: 1.3,
              letterSpacing: "1px",
            }}
          >
            {title}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "40px",
              height: "1px",
              backgroundColor: "#C9A96E",
            }}
          />

          {/* Stanzas */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: format === "square" ? "28px" : "36px",
              flex: 1,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {pageStanzas.map((stanza, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  width: "100%",
                }}
              >
                {stanza.split("\n").map((line, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize,
                      color: "#F5EED8",
                      textAlign: "center",
                      lineHeight: 1.7,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Author credit */}
            <div
              style={{
                fontSize: 14,
                color: "#C9A96E",
                fontFamily: "Inter",
                letterSpacing: "2px",
              }}
            >
              — LEMAGEPOET
            </div>

            {/* Page indicator */}
            {totalPages > 1 && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(245, 238, 216, 0.5)",
                  fontFamily: "Inter",
                  letterSpacing: "1px",
                }}
              >
                {currentPage + 1} / {totalPages}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorantData,
          weight: 300,
          style: "normal" as const,
        },
        {
          name: "Inter",
          data: interData,
          weight: 400,
          style: "normal" as const,
        },
      ],
    },
  );
}
