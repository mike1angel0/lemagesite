import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminSocialClient } from "./admin-social-client";

export default async function AdminSocialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const [sources, reposts, accounts, batches] = await Promise.all([
    prisma.socialSource.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.socialRepost.findMany({
      include: { source: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.socialAccount.findMany(),
    prisma.repostBatch.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const sourceRows = sources.map((s) => ({
    id: s.id,
    url: s.url,
    content: s.content,
    contentType: s.contentType,
    platform: s.platform,
    status: s.status,
    capturedVia: s.capturedVia,
    createdAt: s.createdAt.toISOString(),
  }));

  const repostRows = reposts.map((r) => ({
    id: r.id,
    sourceId: r.sourceId,
    sourceUrl: r.source.url,
    platform: r.platform,
    generatedText: r.generatedText,
    editedText: r.editedText,
    status: r.status,
    platformPostId: r.platformPostId,
    errorMessage: r.errorMessage,
    createdAt: r.createdAt.toISOString(),
  }));

  const accountRows = accounts.map((a) => ({
    id: a.id,
    platform: a.platform,
    accountName: a.accountName,
    expiresAt: a.expiresAt?.toISOString() || null,
  }));

  const batchRows = batches.map((b) => ({
    id: b.id,
    batchSize: b.batchSize,
    contentType: b.contentType,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <AdminSocialClient
      sources={sourceRows}
      reposts={repostRows}
      accounts={accountRows}
      batches={batchRows}
      summary={{
        totalSources: sourceRows.length,
        pendingSources: sourceRows.filter((s) => s.status === "PENDING").length,
        draftReposts: repostRows.filter((r) => r.status === "DRAFT").length,
        approvedReposts: repostRows.filter((r) => r.status === "APPROVED").length,
        postedReposts: repostRows.filter((r) => r.status === "POSTED").length,
        connectedAccounts: accountRows.length,
      }}
    />
  );
}
