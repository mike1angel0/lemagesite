import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";

const SYSTEM_PROMPTS: Record<string, Record<string, string>> = {
  "en-ro": {
    title:
      "You are a literary translator specializing in Romanian poetry. Translate the given English title into Romanian. Be concise and preserve the poetic feel. Return only the translated title, nothing else.",
    body: "You are a literary translator specializing in Romanian poetry. Translate the given English poem into Romanian. Preserve line breaks, rhythm, imagery, and stanza structure exactly. Maintain the emotional tone and poetic devices. Return only the translated poem, nothing else.",
  },
  "ro-en": {
    title:
      "You are a literary translator specializing in poetry. Translate the given Romanian title into English. Be concise and preserve the poetic feel. Return only the translated title, nothing else.",
    body: "You are a literary translator specializing in poetry. Translate the given Romanian poem into English. Preserve line breaks, rhythm, imagery, and stanza structure exactly. Maintain the emotional tone and poetic devices. Return only the translated poem, nothing else.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, from, to, field } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const direction = `${from}-${to}`;
    const prompts = SYSTEM_PROMPTS[direction];
    if (!prompts) {
      return NextResponse.json({ error: "Invalid language pair" }, { status: 400 });
    }

    const systemPrompt = prompts[field] || prompts.body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const translation = response.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
