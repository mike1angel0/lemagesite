"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import type { AuthState } from "@/lib/actions/auth";

async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function updateSettingsAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  const localePreference = formData.get("localePreference") as string | null;
  const emailNotifications = formData.get("emailNotifications") === "true";
  const newsletterSubscribed = formData.get("newsletterSubscribed") === "true";
  const contentPreferences = formData.getAll("contentPreferences") as string[];

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(localePreference && { localePreference }),
      emailNotifications,
      newsletterSubscribed,
      contentPreferences,
    },
  });

  return { success: true };
}

export async function changePasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };
  if (!user.passwordHash) return { error: "No password set for this account" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (newPassword !== confirmNewPassword) {
    return { error: "Passwords do not match" };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function exportAccountDataAction(): Promise<string> {
  const user = await getAuthUser();
  if (!user) return JSON.stringify({ error: "Not authenticated" });

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      membership: true,
      orders: { include: { items: true } },
      savedItems: true,
      accounts: { select: { provider: true, type: true } },
    },
  });

  if (!fullUser) return JSON.stringify({ error: "User not found" });

  const exportData = {
    profile: {
      name: fullUser.name,
      email: fullUser.email,
      bio: fullUser.bio,
      localePreference: fullUser.localePreference,
      emailNotifications: fullUser.emailNotifications,
      newsletterSubscribed: fullUser.newsletterSubscribed,
      contentPreferences: fullUser.contentPreferences,
      createdAt: fullUser.createdAt,
    },
    membership: fullUser.membership
      ? {
          tier: fullUser.membership.tier,
          status: fullUser.membership.status,
          startedAt: fullUser.membership.startedAt,
        }
      : null,
    connectedAccounts: fullUser.accounts.map((a) => ({ provider: a.provider, type: a.type })),
    orders: fullUser.orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
    })),
    savedItems: fullUser.savedItems.map((s) => ({
      contentType: s.contentType,
      contentId: s.contentId,
      savedAt: s.savedAt,
    })),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

export async function deleteAccountAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  const password = formData.get("password") as string;

  if (user.passwordHash) {
    if (!password) return { error: "Password is required to delete your account" };
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { error: "Incorrect password" };
  }

  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/" });

  return { success: true };
}
