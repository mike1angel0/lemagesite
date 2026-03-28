import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.+?\)/g, "")
    .replace(/^[-*>]\s+/gm, "")
    .replace(/---+/g, "")
    .trim();
}

// OpenAI TTS has a 4096 character limit per request
const MAX_CHARS = 4096;

function splitText(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?\n])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > MAX_CHARS) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { contentType, contentId, locale = "en", regenerate = false } = await req.json();

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const isRo = locale === "ro";
    const audioField = isRo ? "audioUrlRo" : "audioUrl";

    // Check for cached audio URL in DB
    let record: { audioUrl: string | null; audioUrlRo: string | null; body?: string | null; bodyRo?: string | null; abstract?: string | null } | null = null;

    if (contentType === "ESSAY") {
      record = await prisma.essay.findUnique({
        where: { id: contentId },
        select: { audioUrl: true, audioUrlRo: true, body: true, bodyRo: true },
      });
    } else if (contentType === "RESEARCH") {
      record = await prisma.researchPaper.findUnique({
        where: { id: contentId },
        select: { audioUrl: true, audioUrlRo: true, abstract: true, body: true },
      });
    } else if (contentType === "POEM") {
      record = await prisma.poem.findUnique({
        where: { id: contentId },
        select: { audioUrl: true, audioUrlRo: true, body: true, bodyRo: true },
      });
    }

    if (!record) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Cache hit — return existing URL for the requested locale (unless regenerating)
    const cachedUrl = isRo ? record.audioUrlRo : record.audioUrl;
    if (cachedUrl && !regenerate) {
      return NextResponse.json({ url: cachedUrl });
    }

    // Build the text to speak based on locale
    let text = "";
    if (contentType === "RESEARCH") {
      // Research doesn't have bodyRo, always use body
      text = [record.abstract ?? "", record.body ?? ""].filter(Boolean).join("\n\n");
    } else if (isRo) {
      // Use Romanian body if available, fall back to English
      const bodyRo = (record as { bodyRo?: string | null }).bodyRo;
      text = bodyRo || record.body || "";
    } else {
      text = record.body ?? "";
    }

    text = stripMarkdown(text);
    if (!text) {
      return NextResponse.json({ error: "No text to speak" }, { status: 400 });
    }

    // Generate audio with OpenAI TTS
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chunks = splitText(text);
    const audioBuffers: Buffer[] = [];

    // Voice & instructions vary by content type
    const isPoem = contentType === "POEM";
    const voice = isPoem ? (isRo ? "onyx" : "fable") : "ash";

    let instructions: string;
    if (isPoem && isRo) {
      instructions = "Ești un actor român de teatru clasic, cu o voce profundă de bariton. Citește poezia în limba română cu accent nativ românesc autentic — fără nicio urmă de accent englez. Pronunță corect toate diacriticele (ă, â, î, ș, ț). Citește LENT — mult mai lent decât vorbirea obișnuită. Pune accent puternic și deliberat pe cuvintele încărcate emoțional, pe adjective și pe imaginile poetice. Fă o pauză vizibilă la sfârșitul FIECĂRUI vers, nu doar între strofe. Între strofe, lasă o tăcere lungă și dramatică. Tratează fiecare vers ca pe o respirație separată. Lasă cuvintele să se așeze înainte de a trece mai departe.";
    } else if (isPoem) {
      instructions = "You are a distinguished British stage actor performing poetry on a grand stage. Use a rich, resonant baritone with received pronunciation. Read SLOWLY — much slower than conversational speech. Place strong, deliberate emphasis on emotionally charged words, adjectives, and vivid imagery. Pause noticeably at the end of EVERY single line, not just stanzas. Between stanzas, leave a long, dramatic silence. Treat each line as its own breath. Savour each word — let it land and resonate before moving to the next. The audience is hanging on every syllable.";
    } else if (isRo) {
      instructions = "Speak in fluent, native Romanian with proper pronunciation of diacritics (ă, â, î, ș, ț). Use a warm, natural pace and clear articulation.";
    } else {
      instructions = "Speak in clear, warm English with a literary tone. Use a natural, engaging pace.";
    }

    for (const chunk of chunks) {
      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice,
        input: chunk,
        instructions,
      });

      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    // Concatenate audio buffers (all MP3, simple concat works for MP3)
    const fullAudio = Buffer.concat(audioBuffers);

    // Upload to Cloudinary (if configured), otherwise return as base64 data URL
    let audioUrl: string;
    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your-cloud-name" &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== "your-api-key";

    if (cloudinaryConfigured) {
      try {
        const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "selenarium/tts",
                resource_type: "video", // Cloudinary uses "video" for audio files
                format: "mp3",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as Record<string, unknown>);
              }
            )
            .end(fullAudio);
        });

        audioUrl = result.secure_url as string;
      } catch (cloudinaryError) {
        console.warn("Cloudinary TTS upload failed, returning inline audio:", cloudinaryError);
        audioUrl = `data:audio/mpeg;base64,${fullAudio.toString("base64")}`;
      }
    } else {
      // No Cloudinary — return as base64 (won't be cached in DB since data URLs are large)
      audioUrl = `data:audio/mpeg;base64,${fullAudio.toString("base64")}`;
    }

    // Cache the URL in DB (only for real URLs, not data URIs)
    if (audioUrl.startsWith("data:")) {
      return NextResponse.json({ url: audioUrl });
    }

    if (contentType === "ESSAY") {
      await prisma.essay.update({
        where: { id: contentId },
        data: { [audioField]: audioUrl },
      });
    } else if (contentType === "RESEARCH") {
      await prisma.researchPaper.update({
        where: { id: contentId },
        data: { [audioField]: audioUrl },
      });
    } else if (contentType === "POEM") {
      await prisma.poem.update({
        where: { id: contentId },
        data: { [audioField]: audioUrl },
      });
    }

    return NextResponse.json({ url: audioUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("TTS generation error:", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
