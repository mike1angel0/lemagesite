"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

const tierMap: Record<string, "FREE" | "SUPPORTER" | "PATRON" | "INNER_CIRCLE"> = {
  Free: "FREE",
  Supporter: "SUPPORTER",
  Patron: "PATRON",
  "Inner Circle": "INNER_CIRCLE",
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" ? user : null;
}

// ─── Poems ────────────────────────────────────────────────

export async function savePoemAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const rawTitle = (formData.get("title") as string)?.trim();
  const rawBody = (formData.get("body") as string)?.trim();
  const tier = (formData.get("tier") as string) || "Free";
  const tags = (formData.get("tags") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim();
  const publish = formData.get("publish") === "true";
  const scheduleDate = (formData.get("scheduleDate") as string)?.trim();
  const language = (formData.get("language") as string)?.trim() || "en";
  const titleTranslation = (formData.get("titleTranslation") as string)?.trim();
  const bodyTranslation = (formData.get("bodyTranslation") as string)?.trim();

  if (!rawTitle) return { error: "Title is required" };
  if (!rawBody) return { error: "Body is required" };

  // Schema: title/body = EN, titleRo/bodyRo = RO
  let title: string;
  let body: string;
  let titleRo: string | null = null;
  let bodyRo: string | null = null;

  if (language === "ro") {
    // Author wrote in Romanian — original goes to Ro fields, translation to EN fields
    titleRo = rawTitle;
    bodyRo = rawBody;
    title = titleTranslation || rawTitle;
    body = bodyTranslation || rawBody;
  } else {
    // Author wrote in English
    title = rawTitle;
    body = rawBody;
    titleRo = titleTranslation || null;
    bodyRo = bodyTranslation || null;
  }

  const slug = slugify(title);
  const existing = await prisma.poem.findUnique({ where: { slug } });
  if (existing) return { error: "A poem with a similar title already exists" };

  // Generate Romanian slug if we have a Romanian title
  let slugRo: string | null = null;
  if (titleRo) {
    const candidate = slugify(titleRo);
    if (candidate && candidate !== slug) {
      const existingRo = await prisma.poem.findUnique({ where: { slugRo: candidate } });
      if (!existingRo) slugRo = candidate;
    }
  }

  await prisma.poem.create({
    data: {
      title,
      slug,
      slugRo,
      body,
      titleRo,
      bodyRo,
      language,
      collection: tags || null,
      coverImage: coverImage || null,
      accessTier: tierMap[tier] || "FREE",
      publishedAt: publish ? (scheduleDate ? new Date(scheduleDate) : new Date()) : null,
    },
  });

  return { success: true };
}

// ─── Research Papers ──────────────────────────────────────

export async function saveResearchAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const abstract = (formData.get("abstract") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const tier = (formData.get("tier") as string) || "Free";
  const tags = (formData.get("tags") as string)?.trim();
  const doi = (formData.get("doi") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const pdfUrl = (formData.get("pdfUrl") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim();
  const publish = formData.get("publish") === "true";
  const scheduleDate = (formData.get("scheduleDate") as string)?.trim();
  const references = (formData.get("references") as string)?.trim();

  if (!title) return { error: "Title is required" };

  const slug = slugify(title);
  const existing = await prisma.researchPaper.findUnique({ where: { slug } });
  if (existing) return { error: "A paper with a similar title already exists" };

  const tagList = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.researchPaper.create({
    data: {
      title,
      slug,
      abstract: abstract || null,
      body: body || null,
      tags: tagList,
      doi: doi || null,
      year: yearStr ? parseInt(yearStr) : null,
      coverImage: coverImage || null,
      pdfUrl: pdfUrl || null,
      references: references || null,
      accessTier: tierMap[tier] || "FREE",
      publishedAt: publish ? (scheduleDate ? new Date(scheduleDate) : new Date()) : null,
    },
  });

  return { success: true };
}

// ─── Photos ──────────────────────────────────────────────

export async function savePhotoAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const description = (formData.get("body") as string)?.trim();
  const tier = (formData.get("tier") as string) || "Free";
  const publish = formData.get("publish") === "true";
  const scheduleDate = (formData.get("scheduleDate") as string)?.trim();
  const language = (formData.get("language") as string) || "ro";
  const titleTranslation = (formData.get("titleTranslation") as string)?.trim();
  const bodyTranslation = (formData.get("bodyTranslation") as string)?.trim();
  const camera = (formData.get("camera") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const photoYear = (formData.get("year") as string)?.trim();
  const seriesName = (formData.get("seriesName") as string)?.trim();

  if (!title) return { error: "Title is required" };
  if (!imageUrl) return { error: "Photo URL is required" };

  // Determine RO/EN fields based on original language
  const titleEn = language === "en" ? title : titleTranslation || null;
  const titleRo = language === "ro" ? title : titleTranslation || null;
  const descEn = language === "en" ? (description || null) : (bodyTranslation || null);
  const descRo = language === "ro" ? (description || null) : (bodyTranslation || null);

  // Build exifData JSON
  const exifData: Record<string, string> = {};
  if (camera) exifData.camera = camera;
  if (location) exifData.location = location;
  if (photoYear) exifData.year = photoYear;

  // Resolve or create series
  let seriesId: string | null = null;
  if (seriesName) {
    const seriesSlug = slugify(seriesName);
    const existing = await prisma.photoSeries.findUnique({ where: { slug: seriesSlug } });
    if (existing) {
      seriesId = existing.id;
    } else {
      const newSeries = await prisma.photoSeries.create({
        data: { name: seriesName, slug: seriesSlug },
      });
      seriesId = newSeries.id;
    }
  }

  const slug = slugify(title);
  const existingPhoto = await prisma.photo.findUnique({ where: { slug } });
  if (existingPhoto) return { error: "A photo with a similar title already exists" };

  await prisma.photo.create({
    data: {
      title: titleEn || title,
      titleRo: titleRo,
      slug,
      imageUrl,
      description: descEn,
      descriptionRo: descRo,
      exifData: Object.keys(exifData).length > 0 ? exifData : undefined,
      seriesId,
      accessTier: tierMap[tier] || "FREE",
      publishedAt: publish ? (scheduleDate ? new Date(scheduleDate) : new Date()) : null,
    },
  });

  return { success: true };
}

// ─── Essays ──────────────────────────────────────────────

export async function saveEssayAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const rawTitle = (formData.get("title") as string)?.trim();
  const rawBody = (formData.get("body") as string)?.trim();
  const tier = (formData.get("tier") as string) || "Free";
  const tags = (formData.get("tags") as string)?.trim();
  const readTimeStr = formData.get("readTime") as string;
  const essayCategory = (formData.get("essayCategory") as string)?.trim();
  const thumbnail = (formData.get("thumbnail") as string)?.trim();
  const publish = formData.get("publish") === "true";
  const scheduleDate = (formData.get("scheduleDate") as string)?.trim();
  const language = (formData.get("language") as string)?.trim() || "en";
  const titleTranslation = (formData.get("titleTranslation") as string)?.trim();
  const bodyTranslation = (formData.get("bodyTranslation") as string)?.trim();
  const references = (formData.get("references") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim();

  if (!rawTitle) return { error: "Title is required" };
  if (!rawBody) return { error: "Body is required" };

  // Schema: title/body = EN, titleRo/bodyRo = RO
  let title: string;
  let body: string;
  let titleRo: string | null = null;
  let bodyRo: string | null = null;

  if (language === "ro") {
    titleRo = rawTitle;
    bodyRo = rawBody;
    title = titleTranslation || rawTitle;
    body = bodyTranslation || rawBody;
  } else {
    title = rawTitle;
    body = rawBody;
    titleRo = titleTranslation || null;
    bodyRo = bodyTranslation || null;
  }

  const slug = slugify(title);
  const existing = await prisma.essay.findUnique({ where: { slug } });
  if (existing) return { error: "An essay with a similar title already exists" };

  await prisma.essay.create({
    data: {
      title,
      slug,
      body,
      titleRo,
      bodyRo,
      category: essayCategory || tags || null,
      readTime: readTimeStr ? parseInt(readTimeStr) : null,
      thumbnail: thumbnail || null,
      references: references || null,
      excerpt: excerpt || null,
      accessTier: tierMap[tier] || "FREE",
      publishedAt: publish ? (scheduleDate ? new Date(scheduleDate) : new Date()) : null,
    },
  });

  return { success: true };
}

// ─── Albums / Tracks ─────────────────────────────────────

export async function saveAlbumAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("body") as string)?.trim();
  const duration = (formData.get("duration") as string)?.trim();
  const publish = formData.get("publish") === "true";

  if (!title) return { error: "Title is required" };

  const slug = slugify(title);
  const existing = await prisma.album.findUnique({ where: { slug } });
  if (existing) return { error: "An album with a similar title already exists" };

  await prisma.album.create({
    data: {
      title,
      slug,
      description: description || null,
      duration: duration || null,
    },
  });

  return { success: true };
}

// ─── Get Content by ID ───────────────────────────────────

export async function getContentByIdAction(id: string) {
  const admin = await requireAdmin();
  if (!admin) return null;

  // Try each content type
  const poem = await prisma.poem.findUnique({ where: { id } });
  if (poem) return { ...poem, contentType: "Poem" as const, publishedAt: poem.publishedAt?.toISOString() ?? null, createdAt: poem.createdAt.toISOString(), updatedAt: poem.updatedAt.toISOString() };

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (photo) return { ...photo, contentType: "Photo" as const, publishedAt: photo.publishedAt?.toISOString() ?? null, createdAt: photo.createdAt.toISOString(), updatedAt: photo.updatedAt.toISOString() };

  const essay = await prisma.essay.findUnique({ where: { id } });
  if (essay) return { ...essay, contentType: "Essay" as const, publishedAt: essay.publishedAt?.toISOString() ?? null, createdAt: essay.createdAt.toISOString(), updatedAt: essay.updatedAt.toISOString() };

  const research = await prisma.researchPaper.findUnique({ where: { id } });
  if (research) return { ...research, contentType: "Research" as const, publishedAt: research.publishedAt?.toISOString() ?? null, createdAt: research.createdAt.toISOString(), updatedAt: research.updatedAt.toISOString() };

  return null;
}

// ─── Update Content ──────────────────────────────────────

export async function updateContentAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  const contentType = formData.get("contentType") as string;
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const tier = (formData.get("tier") as string) || "Free";
  const tags = (formData.get("tags") as string)?.trim();
  const publish = formData.get("publish") === "true";

  if (!id || !contentType) return { error: "Missing id or type" };
  if (!title) return { error: "Title is required" };

  switch (contentType) {
    case "Poem": {
      const poemTitleRo = (formData.get("titleRo") as string)?.trim();
      const poemBodyRo = (formData.get("bodyRo") as string)?.trim();
      await prisma.poem.update({
        where: { id },
        data: {
          title,
          body: body || "",
          titleRo: poemTitleRo || undefined,
          bodyRo: poemBodyRo || undefined,
          collection: tags || null,
          coverImage: (formData.get("coverImage") as string) || undefined,
          accessTier: tierMap[tier] || "FREE",
          publishedAt: publish ? new Date() : null,
        },
      });
      break;
    }
    case "Photo": {
      const photoTitleRo = (formData.get("titleRo") as string)?.trim();
      const photoBodyRo = (formData.get("bodyRo") as string)?.trim();
      const photoCamera = (formData.get("camera") as string)?.trim();
      const photoLocation = (formData.get("location") as string)?.trim();
      const photoYear = (formData.get("year") as string)?.trim();
      const photoSeriesName = (formData.get("seriesName") as string)?.trim();

      // Build exifData
      const photoExif: Record<string, string> = {};
      if (photoCamera) photoExif.camera = photoCamera;
      if (photoLocation) photoExif.location = photoLocation;
      if (photoYear) photoExif.year = photoYear;

      // Resolve series
      let photoSeriesId: string | null | undefined = undefined;
      if (photoSeriesName) {
        const seriesSlug = slugify(photoSeriesName);
        const existingSeries = await prisma.photoSeries.findUnique({ where: { slug: seriesSlug } });
        if (existingSeries) {
          photoSeriesId = existingSeries.id;
        } else {
          const newSeries = await prisma.photoSeries.create({
            data: { name: photoSeriesName, slug: seriesSlug },
          });
          photoSeriesId = newSeries.id;
        }
      }

      await prisma.photo.update({
        where: { id },
        data: {
          title,
          titleRo: photoTitleRo || null,
          description: body || null,
          descriptionRo: photoBodyRo || null,
          imageUrl: (formData.get("imageUrl") as string) || undefined,
          exifData: Object.keys(photoExif).length > 0 ? photoExif : undefined,
          seriesId: photoSeriesId,
          accessTier: tierMap[tier] || "FREE",
          publishedAt: publish ? new Date() : null,
        },
      });
      break;
    }
    case "Essay": {
      const essayCategory = (formData.get("essayCategory") as string)?.trim();
      const readTimeStr = formData.get("readTime") as string;
      const essayTitleRo = (formData.get("titleRo") as string)?.trim();
      const essayBodyRo = (formData.get("bodyRo") as string)?.trim();
      const essayReferences = (formData.get("references") as string)?.trim();
      const essayExcerpt = (formData.get("excerpt") as string)?.trim();
      await prisma.essay.update({
        where: { id },
        data: {
          title,
          body: body || "",
          titleRo: essayTitleRo || undefined,
          bodyRo: essayBodyRo || undefined,
          category: essayCategory || tags || null,
          readTime: readTimeStr ? parseInt(readTimeStr) : undefined,
          thumbnail: (formData.get("thumbnail") as string) || undefined,
          references: essayReferences || null,
          excerpt: essayExcerpt || undefined,
          accessTier: tierMap[tier] || "FREE",
          publishedAt: publish ? new Date() : null,
        },
      });
      break;
    }
    case "Research": {
      const researchReferences = (formData.get("references") as string)?.trim();
      await prisma.researchPaper.update({
        where: { id },
        data: {
          title,
          body: body || null,
          abstract: (formData.get("abstract") as string) || null,
          doi: (formData.get("doi") as string) || null,
          coverImage: (formData.get("coverImage") as string) || undefined,
          pdfUrl: (formData.get("pdfUrl") as string) || null,
          references: researchReferences || null,
          accessTier: tierMap[tier] || "FREE",
          publishedAt: publish ? new Date() : null,
        },
      });
      break;
    }
    default:
      return { error: "Unknown content type" };
  }

  return { success: true };
}

// ─── Delete Content ───────────────────────────────────────

export async function deleteContentAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  const type = formData.get("type") as string;

  if (!id || !type) return { error: "Missing id or type" };

  switch (type) {
    case "Poem":
      await prisma.poem.delete({ where: { id } });
      break;
    case "Research":
      await prisma.researchPaper.delete({ where: { id } });
      break;
    case "Essay":
      await prisma.essay.delete({ where: { id } });
      break;
    case "Photo":
      await prisma.photo.delete({ where: { id } });
      break;
    default:
      return { error: "Unknown content type" };
  }

  return { success: true };
}
