import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ComposeNewsletterClient } from "./compose-client";

export default async function ComposeNewsletterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const subscriberCount = await prisma.user.count({ where: { newsletterSubscribed: true } });

  return <ComposeNewsletterClient subscriberCount={subscriberCount} />;
}
