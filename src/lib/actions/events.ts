"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

function slugify(text: string) {
  return text
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

export async function createEventAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const locationVal = (formData.get("location") as string)?.trim();
  const dateStr = formData.get("date") as string;
  const type = (formData.get("type") as string)?.trim();
  const rsvpUrl = (formData.get("rsvpUrl") as string)?.trim();
  const publish = formData.get("publish") === "true";

  if (!title) return { error: "Title is required" };
  if (!dateStr) return { error: "Date is required" };

  const slug = slugify(title);
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) return { error: "An event with a similar title already exists" };

  await prisma.event.create({
    data: {
      title,
      slug,
      description: description || null,
      location: locationVal || null,
      date: new Date(dateStr),
      type: type || null,
      isUpcoming: new Date(dateStr) > new Date(),
      rsvpUrl: rsvpUrl || null,
    },
  });

  return { success: true };
}

export async function updateEventAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const locationVal = (formData.get("location") as string)?.trim();
  const dateStr = formData.get("date") as string;
  const type = (formData.get("type") as string)?.trim();
  const rsvpUrl = (formData.get("rsvpUrl") as string)?.trim();

  if (!id) return { error: "Missing event id" };
  if (!title) return { error: "Title is required" };

  await prisma.event.update({
    where: { id },
    data: {
      title,
      description: description || null,
      location: locationVal || null,
      date: dateStr ? new Date(dateStr) : undefined,
      type: type || null,
      isUpcoming: dateStr ? new Date(dateStr) > new Date() : undefined,
      rsvpUrl: rsvpUrl || null,
    },
  });

  return { success: true };
}

export async function deleteEventAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing event id" };

  await prisma.event.delete({ where: { id } });
  return { success: true };
}
