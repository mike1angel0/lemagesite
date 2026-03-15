import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminMediaClient } from "./admin-media-client";

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const files = await prisma.mediaFile.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = files.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    type: f.type,
    size: f.size,
    createdAt: f.createdAt.toISOString(),
  }));

  return <AdminMediaClient files={rows} />;
}
