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
    const { contentType, contentId } = await req.json();

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Check for cached audio URL in DB
    let record: { audioUrl: string | null; body?: string | null; abstract?: string | null } | null = null;

    if (contentType === "ESSAY") {
      record = await prisma.essay.findUnique({
        where: { id: contentId },
        select: { audioUrl: true, body: true },
      });
    } else if (contentType === "RESEARCH") {
      record = await prisma.researchPaper.findUnique({
        where: { id: contentId },
        select: { audioUrl: true, abstract: true, body: true },
      });
    } else if (contentType === "POEM") {
      record = await prisma.poem.findUnique({
        where: { id: contentId },
        select: { audioUrl: true, body: true },
      });
    }

    if (!record) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Cache hit — return existing URL
    if (record.audioUrl) {
      return NextResponse.json({ url: record.audioUrl });
    }

    // Build the text to speak
    let text = "";
    if (contentType === "RESEARCH") {
      text = [record.abstract ?? "", record.body ?? ""].filter(Boolean).join("\n\n");
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

    for (const chunk of chunks) {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: chunk,
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
        data: { audioUrl },
      });
    } else if (contentType === "RESEARCH") {
      await prisma.researchPaper.update({
        where: { id: contentId },
        data: { audioUrl },
      });
    } else if (contentType === "POEM") {
      await prisma.poem.update({
        where: { id: contentId },
        data: { audioUrl },
      });
    }

    return NextResponse.json({ url: audioUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("TTS generation error:", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
