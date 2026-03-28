"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

export async function addProductAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priceStr = formData.get("price") as string;
  const category = (formData.get("category") as string) || "BOOKS";
  const stockStr = formData.get("stock") as string;
  const image = (formData.get("image") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };
  const price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) return { error: "Valid price is required" };
  const stock = parseInt(stockStr) || 0;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { error: "A product with a similar name already exists" };

  await prisma.product.create({
    data: {
      title,
      slug,
      description,
      price,
      category: category as "BOOKS" | "PRINTS" | "APPAREL" | "OBJECTS" | "DIGITAL",
      stock,
      image,
    },
  });

  return { success: true };
}

export async function addBookAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const yearStr = formData.get("year") as string;
  const type = (formData.get("type") as string)?.trim() || null;
  const priceStr = formData.get("price") as string;
  const buyUrl = (formData.get("buyUrl") as string)?.trim() || null;
  const quotesRaw = (formData.get("quotes") as string)?.trim() || "";

  if (!title) return { error: "Title is required" };

  const year = yearStr ? parseInt(yearStr) : null;
  const price = priceStr ? parseFloat(priceStr) : null;
  if (price !== null && (isNaN(price) || price < 0)) return { error: "Valid price is required" };

  const quotes = quotesRaw
    ? quotesRaw.split("\n").map((q) => q.trim()).filter(Boolean)
    : undefined;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.book.findUnique({ where: { slug } });
  if (existing) return { error: "A book with a similar title already exists" };

  await prisma.book.create({
    data: {
      title,
      slug,
      description,
      excerpt,
      coverImage,
      year,
      type,
      price,
      buyUrl,
      quotes,
      publishedAt: new Date(),
    },
  });

  return { success: true };
}

export async function deleteProductAction(productId: string): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  await prisma.product.delete({ where: { id: productId } });
  return { success: true };
}

export async function deleteBookAction(bookId: string): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  await prisma.book.delete({ where: { id: bookId } });
  return { success: true };
}
