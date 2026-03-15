import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminQuotesClient } from "./admin-quotes-client";

export default async function AdminQuotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = quotes.map((q) => ({
    id: q.id,
    text: q.text,
    attribution: q.attribution || "",
    location: q.location || "",
    createdAt: q.createdAt.toISOString(),
  }));

  return <AdminQuotesClient quotes={rows} />;
}
