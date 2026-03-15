import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllThreadsForAdmin } from "@/lib/actions/messages";
import { AdminMessagesClient } from "./admin-messages-client";

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const rawThreads = await getAllThreadsForAdmin();

  const threads = rawThreads.map((t) => ({
    id: t.id,
    subject: t.subject,
    body: t.body,
    isFromAdmin: t.isFromAdmin,
    read: t.read,
    createdAt: t.createdAt.toISOString(),
    user: t.user,
    replies: t.replies.map((r) => ({
      id: r.id,
      body: r.body,
      isFromAdmin: r.isFromAdmin,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return <AdminMessagesClient threads={threads} />;
}
