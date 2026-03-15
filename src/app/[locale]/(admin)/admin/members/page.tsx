import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminMembersClient } from "./admin-members-client";

export default async function AdminMembersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const users = await prisma.user.findMany({
    include: { membership: true },
    orderBy: { createdAt: "desc" },
  });

  const members = users.map((u) => ({
    id: u.id,
    name: u.name || "",
    email: u.email,
    tier: u.membership?.tier || "FREE",
    status: u.membership?.status || "ACTIVE",
    joined: u.createdAt.toISOString(),
  }));

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const supporterCount = members.filter((m) => m.tier === "SUPPORTER").length;
  const patronCount = members.filter((m) => m.tier === "PATRON").length;
  const innerCircleCount = members.filter((m) => m.tier === "INNER_CIRCLE").length;

  return (
    <AdminMembersClient
      members={members}
      summary={{
        total: totalCount,
        active: activeCount,
        supporters: supporterCount,
        patrons: patronCount,
        innerCircle: innerCircleCount,
      }}
    />
  );
}
