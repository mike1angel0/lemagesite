"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { AuthState } from "@/lib/actions/auth";

export async function addMemberAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const tier = (formData.get("tier") as string) || "FREE";
  const password = (formData.get("password") as string)?.trim();

  if (!name || !email) return { error: "Name and email are required" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with this email already exists" };

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: new Date(),
      ...(passwordHash && { passwordHash }),
    },
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      tier: tier as "FREE" | "SUPPORTER" | "PATRON" | "INNER_CIRCLE",
      status: "ACTIVE",
    },
  });

  return { success: true };
}
