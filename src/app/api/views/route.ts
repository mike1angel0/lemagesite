import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { contentType, contentId, sessionId } = await req.json();

    if (!contentType || !contentId || !sessionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Deduplicate: same session + content within 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.contentView.findFirst({
      where: {
        contentType,
        contentId,
        sessionId,
        viewedAt: { gte: oneDayAgo },
      },
    });

    if (!existing) {
      await prisma.contentView.create({
        data: { contentType, contentId, sessionId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
