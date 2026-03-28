import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";

const SYSTEM_PROMPTS: Record<string, string> = {
  default:
    "You summarize text for minimalist illustration prompts. Given the full text of a creative work, produce a 2-3 sentence summary capturing the core visual metaphors, emotional atmosphere, and symbolic imagery. Focus on abstract, poetic elements — what shapes, silhouettes, natural forms, or symbolic objects could represent the work's essence. Be evocative and metaphoric, not literal.",
  instagram:
    "You write compelling Instagram carousel text for essays and articles. Given the full text, write a 3-4 sentence teaser that hooks readers and makes them want to read the full piece. Write in a thought-provoking, slightly provocative tone. Don't use hashtags or emojis. Don't start with a question. Be intellectual but accessible. The text will appear on a dark, elegant image slide.",
  excerpt:
    "Write a compelling 2-3 sentence summary of this essay for display on listing pages. Capture the key argument or insight. Be intellectual but accessible. No hashtags or emojis.",
  abstract:
    "Write a concise academic abstract (150-250 words) for this research paper. Include the main argument, methodology, key findings, and significance. Use formal academic tone.",
  "photo-caption":
    "Write a single powerful, evocative caption for a photograph. It should read like a meaningful quote — short (1-2 sentences max), poetic, and impactful. Think like a photographer's artist statement. No hashtags, no emojis. Be profound but not pretentious.",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, contentType, style, imageUrl } = await req.json();

    if (!content?.trim() && style !== "photo-caption") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Vision-based photo caption: send the image to GPT-4o
    if (style === "photo-caption" && imageUrl) {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPTS["photo-caption"] },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
            { type: "text", text: content?.trim()
              ? `Write a powerful caption for this photograph titled "${content.slice(0, 200)}".`
              : "Write a powerful caption for this photograph." },
          ],
        },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 100,
        temperature: 0.7,
      });

      const summary = response.choices[0]?.message?.content?.trim() || "";
      return NextResponse.json({ summary });
    }

    // Text-only photo caption fallback (no image uploaded yet)
    if (style === "photo-caption") {
      if (!content?.trim()) {
        return NextResponse.json({ error: "Upload a photo or enter a title first" }, { status: 400 });
      }
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS["photo-caption"] },
          { role: "user", content: `Write a powerful caption for a photograph titled "${content.slice(0, 200)}":` },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });
      const summary = response.choices[0]?.message?.content?.trim() || "";
      return NextResponse.json({ summary });
    }

    const systemPrompt = SYSTEM_PROMPTS[style] || SYSTEM_PROMPTS.default;
    let userPrompt: string;
    if (style === "instagram") {
      userPrompt = `Write an Instagram carousel teaser for this ${contentType || "essay"}:\n\n${content.slice(0, 4000)}`;
    } else if (style === "excerpt") {
      userPrompt = `Write a summary/excerpt for this essay:\n\n${content.slice(0, 4000)}`;
    } else if (style === "abstract") {
      userPrompt = `Write an academic abstract for this research paper:\n\n${content.slice(0, 4000)}`;
    } else {
      userPrompt = `Summarize this ${contentType || "text"} for an image generation prompt:\n\n${content.slice(0, 4000)}`;
    }

    const maxTokens = (style === "excerpt" || style === "abstract") ? 500 : 250;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
