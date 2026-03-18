import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STYLE_SUFFIX = "Photorealistic photo, shot on Canon 5D Mark IV. No text, no labels, no watermarks, no color swatches. Fill entire frame edge-to-edge. Warm golden hour tones with navy and ivory accents. Human subject with detailed realistic face.";

export async function POST(req: NextRequest) {
  // Configure inside handler to ensure env vars are available
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

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

    // Append style rules to ensure consistent output
    const fullPrompt = prompt.includes("CRITICAL") ? prompt : `${prompt}\n\n${STYLE_SUFFIX}`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      size: "1792x1024",
      quality: "hd",
      style: "natural",
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
