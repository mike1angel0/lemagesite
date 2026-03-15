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
