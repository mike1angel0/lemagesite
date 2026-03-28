import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postToPlatform } from "@/lib/social/platforms";

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
  const repostIds: string[] = body.repostIds;
  const markOnly: boolean = body.markOnly === true;

  if (!repostIds?.length) {
    return NextResponse.json({ error: "No repost IDs provided" }, { status: 400 });
  }

  const results: { id: string; platform: string; status: string; error?: string; url?: string }[] = [];

  for (const id of repostIds) {
    const repost = await prisma.socialRepost.findUnique({
      where: { id },
    });

    if (!repost) {
      results.push({ id, platform: "unknown", status: "skipped", error: "Not found" });
      continue;
    }

    // markOnly mode: just mark as POSTED without calling any platform API
    if (markOnly) {
      await prisma.socialRepost.update({
        where: { id },
        data: { status: "POSTED" },
      });
      results.push({ id, platform: repost.platform, status: "posted" });
      continue;
    }

    if (repost.status !== "APPROVED") {
      results.push({ id, platform: repost.platform, status: "skipped", error: "Not approved" });
      continue;
    }

    // Find connected account for this platform
    const account = await prisma.socialAccount.findUnique({
      where: { platform: repost.platform },
    });

    if (!account) {
      await prisma.socialRepost.update({
        where: { id },
        data: { status: "FAILED", errorMessage: "No connected account for this platform" },
      });
      results.push({ id, platform: repost.platform, status: "failed", error: "No connected account" });
      continue;
    }

    try {
      const text = repost.editedText || repost.generatedText;
      const result = await postToPlatform(repost.platform, account.accessToken, text);

      await prisma.socialRepost.update({
        where: { id },
        data: {
          status: "POSTED",
          platformPostId: result.postId,
          accountId: account.id,
        },
      });

      results.push({ id, platform: repost.platform, status: "posted", url: result.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await prisma.socialRepost.update({
        where: { id },
        data: { status: "FAILED", errorMessage: message },
      });
      results.push({ id, platform: repost.platform, status: "failed", error: message });
    }
  }

  return NextResponse.json({ results });
}
