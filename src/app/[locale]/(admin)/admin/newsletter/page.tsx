import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminNewsletterClient } from "./admin-newsletter-client";

export default async function AdminNewsletterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const [newsletters, subscriberCount] = await Promise.all([
    prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where: { newsletterSubscribed: true } }),
  ]);

  const rows = newsletters.map((n) => ({
    id: n.id,
    subject: n.subject,
    status: n.status,
    scheduledAt: n.scheduledAt?.toISOString() || null,
    sentAt: n.sentAt?.toISOString() || null,
    openRate: n.openRate,
    clickRate: n.clickRate,
    createdAt: n.createdAt.toISOString(),
  }));

  const drafts = newsletters.filter((n) => n.status === "DRAFT").length;
  const scheduled = newsletters.filter((n) => n.status === "SCHEDULED").length;
  const sent = newsletters.filter((n) => n.status === "SENT").length;

  return (
    <AdminNewsletterClient
      newsletters={rows}
      summary={{ subscribers: subscriberCount, drafts, scheduled, sent }}
    />
  );
}
