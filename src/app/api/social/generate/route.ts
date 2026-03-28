import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRepostTexts } from "@/lib/social/generate";
import {
  CONTENT_TYPE_PLATFORMS,
  DEFAULT_PLATFORMS,
  DEFAULT_BATCH_SIZE,
  type PlatformKey,
} from "@/lib/social/constants";

function detectPlatformFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname === "x.com" || hostname === "twitter.com") return "TWITTER";
    if (hostname === "facebook.com" || hostname === "fb.com" || hostname.endsWith(".facebook.com")) return "FACEBOOK";
    if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) return "LINKEDIN";
    if (hostname === "instagram.com") return "INSTAGRAM";
    if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) return "TIKTOK";
  } catch { /* ignore */ }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const batchSize = body.batchSize || DEFAULT_BATCH_SIZE;
  const contentTypeFilter = body.contentType || null;

  // Create batch
  const batch = await prisma.repostBatch.create({
    data: {
      batchSize,
      contentType: contentTypeFilter,
      status: "PROCESSING",
    },
  });

  try {
    // Fetch pending sources
    const where: Record<string, unknown> = { status: "PENDING" };
    if (contentTypeFilter) where.contentType = contentTypeFilter;

    const sources = await prisma.socialSource.findMany({
      where,
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });

    if (sources.length === 0) {
      await prisma.repostBatch.update({
        where: { id: batch.id },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ message: "No pending sources", batchId: batch.id, count: 0 });
    }

    // Generate texts via Claude
    const inputs = sources.map((s) => ({
      url: s.url,
      content: s.content,
      contentType: s.contentType,
      platform: s.platform || detectPlatformFromUrl(s.url),
    }));

    const generated = await generateRepostTexts(inputs);

    // Create repost records
    let repostCount = 0;
    for (const source of sources) {
      const platformTexts = generated.get(source.url);
      if (!platformTexts) continue;

      // If source came from a social platform, only repost to that same platform
      const detectedPlatform = source.platform || detectPlatformFromUrl(source.url);
      const targetPlatforms = detectedPlatform
        ? [detectedPlatform as PlatformKey]
        : source.contentType
          ? CONTENT_TYPE_PLATFORMS[source.contentType] || DEFAULT_PLATFORMS
          : DEFAULT_PLATFORMS;

      for (const platform of targetPlatforms) {
        const text = platformTexts[platform as PlatformKey];
        if (!text) continue;

        await prisma.socialRepost.create({
          data: {
            sourceId: source.id,
            platform: platform as PlatformKey,
            generatedText: text,
            status: "DRAFT",
            batchId: batch.id,
          },
        });
        repostCount++;
      }

      // Update source status
      await prisma.socialSource.update({
        where: { id: source.id },
        data: { status: "READY", batchId: batch.id },
      });
    }

    await prisma.repostBatch.update({
      where: { id: batch.id },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      message: "Generation complete",
      batchId: batch.id,
      sourcesProcessed: sources.length,
      repostsCreated: repostCount,
    });
  } catch (error) {
    await prisma.repostBatch.update({
      where: { id: batch.id },
      data: { status: "FAILED" },
    });
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed", batchId: batch.id },
      { status: 500 }
    );
  }
}
