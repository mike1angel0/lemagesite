import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminEventsClient } from "./admin-events-client";

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
  });

  const rows = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type || "",
    isUpcoming: e.isUpcoming,
    date: e.date.toISOString(),
    location: e.location || "",
  }));

  return <AdminEventsClient events={rows} />;
}
