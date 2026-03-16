import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, category } = await req.json();

    if (!title?.trim() && !body?.trim()) {
      return NextResponse.json({ error: "Title or body is required" }, { status: 400 });
    }

    // Gather existing tags from all content types
    const [poems, essays, research] = await Promise.all([
      prisma.poem.findMany({ select: { collection: true }, distinct: ["collection"] }),
      prisma.essay.findMany({ select: { category: true }, distinct: ["category"] }),
      prisma.researchPaper.findMany({ select: { tags: true } }),
    ]);

    const existingTags = new Set<string>();
    poems.forEach((p) => p.collection && existingTags.add(p.collection));
    essays.forEach((e) => e.category && existingTags.add(e.category));
    research.forEach((r) => r.tags.forEach((t) => existingTags.add(t)));

    const existingList = [...existingTags].filter(Boolean).join(", ");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You suggest tags for creative content on a literary portfolio site. Given a piece of content, suggest 5-8 relevant tags. Prefer reusing existing tags when they fit. You may also suggest new tags when appropriate.

Existing tags in the system: ${existingList || "none yet"}

Rules:
- Tags should be lowercase, 1-3 words each
- Focus on themes, mood, style, and subject matter
- For poetry: include literary devices, emotional tone, imagery themes
- For essays: include topic areas, philosophical themes
- For research: include academic fields, methodologies
- Return ONLY a JSON array of strings, nothing else. Example: ["silence", "memory", "winter imagery"]`,
        },
        {
          role: "user",
          content: `Category: ${category || "General"}\nTitle: ${title || "Untitled"}\n\nContent:\n${(body || "").slice(0, 3000)}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    let tags: string[];
    try {
      tags = JSON.parse(raw);
      if (!Array.isArray(tags)) tags = [];
    } catch {
      // Try to extract tags from non-JSON response
      tags = raw.replace(/[\[\]"]/g, "").split(",").map((t) => t.trim()).filter(Boolean);
    }

    return NextResponse.json({ tags, existingTags: [...existingTags].filter(Boolean) });
  } catch (error) {
    console.error("Tag suggestion error:", error);
    return NextResponse.json({ error: "Tag suggestion failed" }, { status: 500 });
  }
}
