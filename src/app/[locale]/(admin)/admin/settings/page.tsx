import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminSettingsClient } from "./admin-settings-client";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const settings = await prisma.siteSetting.findMany();

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  const stripeConnected = !!process.env.STRIPE_SECRET_KEY;

  return (
    <AdminSettingsClient
      initialSettings={settingsMap}
      stripeConnected={stripeConnected}
    />
  );
}
