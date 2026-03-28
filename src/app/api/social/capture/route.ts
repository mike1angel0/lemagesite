import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function extractContent(url: string, platform: string | null): Promise<string | null> {
  try {
    // Twitter: use oembed API (no auth needed)
    if (platform === "TWITTER") {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        // oembed returns HTML — strip tags to get text
        const html: string = data.html || "";
        const text = html
          .replace(/<blockquote[^>]*>/gi, "")
          .replace(/<\/blockquote>/gi, "")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
          .replace(/<[^>]+>/g, "")
          .replace(/&mdash;/g, "—")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        return text || null;
      }
    }

    // For all platforms: try fetching the page and extracting og:description / meta description
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Selenarium/1.0)",
      },
    });
    if (res.ok) {
      const html = await res.text();
      // Try og:description first
      const ogMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i)
        || html.match(/<meta\s+content=["']([\s\S]*?)["']\s+property=["']og:description["']\s*\/?>/i);
      if (ogMatch?.[1]) {
        return ogMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
      }
      // Fallback to meta description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i)
        || html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']\s*\/?>/i);
      if (descMatch?.[1]) {
        return descMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
      }
    }
  } catch {
    // Extraction failed — not critical
  }
  return null;
}

export async function POST(req: NextRequest) {
  // Auth: admin session OR API key
  const apiKey = req.headers.get("x-api-key");
  const isApiKeyAuth = apiKey && apiKey === process.env.SOCIAL_CAPTURE_API_KEY;

  if (!isApiKeyAuth) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let url: string;
  let content: string | null = null;
  let contentType: string | null = null;
  let capturedVia = "api";

  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await req.json();
    url = body.url?.trim();
    content = body.content?.trim() || null;
    contentType = body.contentType?.trim() || null;
    capturedVia = body.capturedVia || "api";
  } else {
    const formData = await req.formData();
    url = (formData.get("url") as string)?.trim();
    content = (formData.get("content") as string)?.trim() || null;
    contentType = (formData.get("contentType") as string)?.trim() || null;
    capturedVia = (formData.get("capturedVia") as string)?.trim() || "share";
  }

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Auto-detect platform from URL
  let platform: string | null = null;
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname === "x.com" || hostname === "twitter.com") platform = "TWITTER";
    else if (hostname === "facebook.com" || hostname === "fb.com" || hostname.endsWith(".facebook.com")) platform = "FACEBOOK";
    else if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) platform = "LINKEDIN";
    else if (hostname === "instagram.com") platform = "INSTAGRAM";
    else if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) platform = "TIKTOK";
  } catch { /* ignore invalid URLs */ }

  // Dedup by URL
  const existing = await prisma.socialSource.findUnique({ where: { url } });
  if (existing) {
    return NextResponse.json({ message: "Already captured", id: existing.id });
  }

  // Auto-extract content if none provided
  if (!content) {
    content = await extractContent(url, platform);
  }

  const source = await prisma.socialSource.create({
    data: { url, content, contentType, platform, capturedVia },
  });

  return NextResponse.json({ message: "Captured", id: source.id }, { status: 201 });
}
