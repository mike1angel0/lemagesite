import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STYLE_SUFFIX = "Cute, playful ink and watercolor drawing. Warm, bright, optimistic mood. Abstract metaphoric human silhouette, not a realistic face. Warm palette: honey gold (#C9A962), soft amber (#C8944A), ivory (#F5EED8) as dominant, steel blue (#A8B4C8) and navy (#0B0E13) for accents. CRITICAL: Fill the ENTIRE frame edge-to-edge, no white space, no margins, no empty borders. No text, no watermarks, no color swatches.";

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
      style: "vivid",
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

    // Upload to Cloudinary — trim white borders and fill to exact dimensions
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "selenarium/ai-generated",
            transformation: [
              { effect: "trim:20" },                    // auto-trim white/near-white borders (20 color tolerance)
              { width: 1792, height: 1024, crop: "fill", gravity: "auto" }, // fill back to exact dimensions
            ],
          },
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
