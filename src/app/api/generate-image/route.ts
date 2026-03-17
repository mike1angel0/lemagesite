import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PROMPTS: Record<string, string> = {
  poem: "Create an atmospheric, artistic illustration for a poem about: {CONTENT}. Dark, moody aesthetic with deep blues and golds.",
  essay: "Create a conceptual editorial illustration for an essay about: {CONTENT}. Sophisticated, minimal, dark tones.",
  research: "Create an abstract scientific visualization for a paper about: {CONTENT}. Academic, modern, dark palette.",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1792x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    // Download the image from the temporary OpenAI URL
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary for permanent storage (OpenAI URLs expire in ~2 hours)
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "selenarium/ai-generated" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as Record<string, unknown>);
          }
        )
        .end(buffer);
    });

    await prisma.mediaFile.create({
      data: {
        name: `ai-generated-${Date.now()}.png`,
        url: result.secure_url as string,
        type: "image/png",
        size: buffer.length,
        cloudinaryId: result.public_id as string,
      },
    });

    return NextResponse.json({ url: result.secure_url as string });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
