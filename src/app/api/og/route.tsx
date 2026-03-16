import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Selenarium";
  const subtitle = searchParams.get("subtitle") ?? "";
  const type = searchParams.get("type") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #101828 0%, #1a2035 50%, #0d1117 100%)",
          fontFamily: "serif",
        }}
      >
        {/* Decorative accent line */}
        <div
          style={{
            width: "60px",
            height: "3px",
            background: "#c9a96e",
            marginBottom: "24px",
            display: "flex",
          }}
        />

        {/* Type badge */}
        {type && (
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#c9a96e",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            {type}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? "42px" : "52px",
            fontWeight: 300,
            color: "#e8e0d4",
            lineHeight: 1.2,
            maxWidth: "900px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: "18px",
              color: "#8a8a8a",
              marginTop: "16px",
              maxWidth: "700px",
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            {subtitle.length > 120 ? subtitle.slice(0, 117) + "..." : subtitle}
          </div>
        )}

        {/* Footer branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "40px",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 300,
              color: "#555",
              letterSpacing: "4px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Selenarium
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
