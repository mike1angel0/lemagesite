import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const [
    totalUsers,
    totalMembers,
    poemCount,
    photoCount,
    essayCount,
    researchCount,
    productCount,
    subscriberCount,
    partnerCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.poem.count(),
    prisma.photo.count(),
    prisma.essay.count(),
    prisma.researchPaper.count(),
    prisma.product.count(),
    prisma.subscriber.count(),
    prisma.partner.count(),
  ]);

  const contentCount = poemCount + photoCount + essayCount + researchCount;

  // Count memberships by tier
  const [freeCount, supporterCount, patronCount, innerCircleCount] =
    await Promise.all([
      prisma.membership.count({ where: { tier: "FREE", status: "ACTIVE" } }),
      prisma.membership.count({ where: { tier: "SUPPORTER", status: "ACTIVE" } }),
      prisma.membership.count({ where: { tier: "PATRON", status: "ACTIVE" } }),
      prisma.membership.count({ where: { tier: "INNER_CIRCLE", status: "ACTIVE" } }),
    ]);

  return (
    <AdminDashboardClient
      stats={{
        totalUsers,
        totalMembers,
        contentCount,
        poemCount,
        photoCount,
        essayCount,
        productCount,
        subscriberCount,
        partnerCount,
      }}
      tiers={{
        free: freeCount,
        supporter: supporterCount,
        patron: patronCount,
        innerCircle: innerCircleCount,
      }}
    />
  );
}
