import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPartnershipsClient } from "./admin-partnerships-client";

export default async function AdminPartnershipsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = partners.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    url: p.url,
    logo: p.logo,
  }));

  return <AdminPartnershipsClient partners={serialized} />;
}
