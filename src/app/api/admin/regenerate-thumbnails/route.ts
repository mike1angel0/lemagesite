import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const expiredPattern = "oaidalleapiprodscus.blob.core.windows.net";

  const [expiredPoems, expiredEssays, expiredResearch] = await Promise.all([
    prisma.poem.findMany({
      where: { coverImage: { contains: expiredPattern } },
      select: { id: true, title: true, coverImage: true },
    }),
    prisma.essay.findMany({
      where: { thumbnail: { contains: expiredPattern } },
      select: { id: true, title: true, thumbnail: true },
    }),
    prisma.researchPaper.findMany({
      where: { coverImage: { contains: expiredPattern } },
      select: { id: true, title: true, coverImage: true },
    }),
  ]);

  const expired = [
    ...expiredPoems.map((p) => ({ type: "POEM" as const, id: p.id, title: p.title, url: p.coverImage })),
    ...expiredEssays.map((e) => ({ type: "ESSAY" as const, id: e.id, title: e.title, url: e.thumbnail })),
    ...expiredResearch.map((r) => ({ type: "RESEARCH" as const, id: r.id, title: r.title, url: r.coverImage })),
  ];

  // For each expired item, try to regenerate via DALL-E and upload to Cloudinary
  let fixed = 0;
  const errors: string[] = [];

  for (const item of expired) {
    try {
      // Generate new image
      const genRes = await fetch(`${process.env.NEXTAUTH_URL || ""}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Atmospheric illustration for "${item.title}". Dark color palette with deep navy, muted steel blue, warm gold, and warm ivory tones.` }),
      });

      if (!genRes.ok) {
        errors.push(`Failed to generate image for ${item.title}`);
        continue;
      }

      const { url: newUrl } = await genRes.json();

      // Update the DB record
      switch (item.type) {
        case "POEM":
          await prisma.poem.update({ where: { id: item.id }, data: { coverImage: newUrl } });
          break;
        case "ESSAY":
          await prisma.essay.update({ where: { id: item.id }, data: { thumbnail: newUrl } });
          break;
        case "RESEARCH":
          await prisma.researchPaper.update({ where: { id: item.id }, data: { coverImage: newUrl } });
          break;
      }
      fixed++;
    } catch (err) {
      errors.push(`Error processing ${item.title}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return NextResponse.json({
    total: expired.length,
    fixed,
    errors,
  });
}
