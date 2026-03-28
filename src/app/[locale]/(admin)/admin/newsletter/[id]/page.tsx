import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditNewsletterClient } from "./edit-newsletter-client";

export default async function EditNewsletterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const newsletter = await prisma.newsletter.findUnique({ where: { id } });
  if (!newsletter) notFound();

  const subscriberCount = await prisma.user.count({ where: { newsletterSubscribed: true } });

  return (
    <EditNewsletterClient
      newsletter={{
        id: newsletter.id,
        subject: newsletter.subject,
        previewText: newsletter.previewText,
        body: newsletter.body,
        status: newsletter.status,
        scheduledAt: newsletter.scheduledAt?.toISOString() ?? null,
        audience: newsletter.audience,
        minimumTier: newsletter.minimumTier,
        fromName: newsletter.fromName,
        replyTo: newsletter.replyTo,
        linkedContent: newsletter.linkedContent as unknown[] | null,
      }}
      subscriberCount={subscriberCount}
    />
  );
}
