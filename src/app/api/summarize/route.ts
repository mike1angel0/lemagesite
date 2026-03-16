import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";

const SYSTEM_PROMPTS: Record<string, string> = {
  default:
    "You summarize text for image generation prompts. Given the full text of a creative work, produce a 2-3 sentence summary capturing the core themes, mood, and imagery. Focus on visual elements and emotional tone, not plot details. Be concise and evocative.",
  instagram:
    "You write compelling Instagram carousel text for essays and articles. Given the full text, write a 3-4 sentence teaser that hooks readers and makes them want to read the full piece. Write in a thought-provoking, slightly provocative tone. Don't use hashtags or emojis. Don't start with a question. Be intellectual but accessible. The text will appear on a dark, elegant image slide.",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, contentType, style } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = SYSTEM_PROMPTS[style] || SYSTEM_PROMPTS.default;
    const userPrompt = style === "instagram"
      ? `Write an Instagram carousel teaser for this ${contentType || "essay"}:\n\n${content.slice(0, 4000)}`
      : `Summarize this ${contentType || "text"} for an image generation prompt:\n\n${content.slice(0, 4000)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
