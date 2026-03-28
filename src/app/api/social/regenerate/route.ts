import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateSingleRepost } from "@/lib/social/generate";
import type { PlatformKey } from "@/lib/social/constants";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { repostId } = await req.json();
  if (!repostId) {
    return NextResponse.json({ error: "Missing repostId" }, { status: 400 });
  }

  const repost = await prisma.socialRepost.findUnique({
    where: { id: repostId },
    include: { source: true },
  });

  if (!repost) {
    return NextResponse.json({ error: "Repost not found" }, { status: 404 });
  }

  const currentText = repost.editedText || repost.generatedText;

  const newText = await regenerateSingleRepost(
    repost.platform as PlatformKey,
    repost.source.url,
    repost.source.content,
    repost.source.platform,
    currentText
  );

  await prisma.socialRepost.update({
    where: { id: repostId },
    data: { generatedText: newText, editedText: null },
  });

  return NextResponse.json({ text: newText });
}
