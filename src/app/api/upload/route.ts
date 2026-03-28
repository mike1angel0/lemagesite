import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "selenarium", image_metadata: true },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as Record<string, unknown>);
          }
        )
        .end(buffer);
    });

    const mediaFile = await prisma.mediaFile.create({
      data: {
        name: file.name,
        url: result.secure_url as string,
        type: file.type,
        size: file.size,
        cloudinaryId: result.public_id as string,
      },
    });

    // Extract EXIF metadata if available
    const exif: Record<string, string | undefined> = {};
    const meta = result.image_metadata as Record<string, string> | undefined;
    if (meta) {
      if (meta.Make && meta.Model) exif.camera = `${meta.Make} ${meta.Model}`;
      else if (meta.Model) exif.camera = meta.Model;
      if (meta.GPSLatitude || meta.GPSPosition) exif.location = meta.GPSPosition || `${meta.GPSLatitude}, ${meta.GPSLongitude}`;
    }

    return NextResponse.json({ ...mediaFile, secure_url: mediaFile.url, exif, width: result.width, height: result.height });
  } catch (error: unknown) {
    const detail = error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
    console.error("Upload error:", detail);
    return NextResponse.json({ error: `Upload failed: ${detail}` }, { status: 500 });
  }
}
