import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getAnalyticsAction } from "@/lib/actions/analytics";
import { AdminAnalyticsClient } from "./admin-analytics-client";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const data = await getAnalyticsAction();
  if (!data) redirect("/login");

  return <AdminAnalyticsClient data={data} />;
}
