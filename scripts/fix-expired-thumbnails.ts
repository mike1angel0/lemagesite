/**
 * Finds all essays and research papers with expired OpenAI DALL-E URLs
 * and regenerates thumbnails, saving them to /public/images/thumbnails/.
 *
 * Usage: npx tsx scripts/fix-expired-thumbnails.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const THUMB_DIR = path.join(process.cwd(), "public", "images", "thumbnails");

function isExpiredOpenAIUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("oaidalleapiprodscus") || url.includes("blob.core.windows.net");
}

async function generateAndSave(title: string, category: string, slug: string): Promise<string> {
  const prompt = `Create an atmospheric, artistic illustration for an article titled "${title}" (${category}). Dark, moody aesthetic with deep blues, golds, and cosmic tones. Abstract, editorial style. No text.`;

  console.log(`  Generating image for: ${title}...`);
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1792x1024",
    quality: "standard",
    n: 1,
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) throw new Error(`No image generated for ${slug}`);

  // Download
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save locally
  const filename = `${slug}.png`;
  const filePath = path.join(THUMB_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  // Return the public path
  return `/images/thumbnails/${filename}`;
}

async function main() {
  // Ensure directory exists
  fs.mkdirSync(THUMB_DIR, { recursive: true });

  // Find essays with expired URLs
  const essays = await prisma.essay.findMany({
    select: { id: true, title: true, slug: true, category: true, thumbnail: true },
  });

  const brokenEssays = essays.filter((e) => isExpiredOpenAIUrl(e.thumbnail));
  console.log(`Found ${brokenEssays.length} essays with expired OpenAI thumbnail URLs`);

  for (const essay of brokenEssays) {
    try {
      const newUrl = await generateAndSave(
        essay.title,
        essay.category ?? "essay",
        essay.slug
      );
      await prisma.essay.update({
        where: { id: essay.id },
        data: { thumbnail: newUrl },
      });
      console.log(`  ✓ Fixed: ${essay.title} → ${newUrl}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${essay.title}`, err);
    }
  }

  // Find research papers with expired URLs
  const papers = await prisma.researchPaper.findMany({
    select: { id: true, title: true, slug: true, coverImage: true, tags: true },
  });

  const brokenPapers = papers.filter((p) => isExpiredOpenAIUrl(p.coverImage));
  console.log(`Found ${brokenPapers.length} research papers with expired OpenAI cover URLs`);

  for (const paper of brokenPapers) {
    try {
      const newUrl = await generateAndSave(
        paper.title,
        paper.tags?.[0] ?? "research",
        paper.slug
      );
      await prisma.researchPaper.update({
        where: { id: paper.id },
        data: { coverImage: newUrl },
      });
      console.log(`  ✓ Fixed: ${paper.title} → ${newUrl}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${paper.title}`, err);
    }
  }

  // Also check poems
  const poems = await prisma.poem.findMany({
    select: { id: true, title: true, slug: true, coverImage: true },
  });

  const brokenPoems = poems.filter((p) => isExpiredOpenAIUrl(p.coverImage));
  console.log(`Found ${brokenPoems.length} poems with expired OpenAI cover URLs`);

  for (const poem of brokenPoems) {
    try {
      const newUrl = await generateAndSave(poem.title, "poetry", poem.slug);
      await prisma.poem.update({
        where: { id: poem.id },
        data: { coverImage: newUrl },
      });
      console.log(`  ✓ Fixed: ${poem.title} → ${newUrl}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${poem.title}`, err);
    }
  }

  const total = brokenEssays.length + brokenPapers.length + brokenPoems.length;
  if (total === 0) {
    console.log("\nNo expired OpenAI URLs found. All thumbnails are good!");
  } else {
    console.log(`\nDone! Fixed ${total} expired thumbnails.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
