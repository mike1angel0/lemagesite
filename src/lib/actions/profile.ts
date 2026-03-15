"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

export async function updateProfileAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || undefined, bio: bio || "" },
  });

  return { success: true };
}
