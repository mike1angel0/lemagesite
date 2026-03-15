import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountClient } from "./account-client";
import { getSavedItems } from "@/lib/actions/saved";
import { getMessagesForUser } from "@/lib/actions/messages";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { membership: true, accounts: true },
  });

  if (!user) redirect("/login");

  const [savedItems, rawMessages] = await Promise.all([
    getSavedItems(user.id),
    getMessagesForUser(user.id),
  ]);

  const messages = rawMessages.map((m) => ({
    id: m.id,
    subject: m.subject,
    body: m.body,
    isFromAdmin: m.isFromAdmin,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
    replies: m.replies.map((r) => ({
      id: r.id,
      body: r.body,
      isFromAdmin: r.isFromAdmin,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return (
    <AccountClient
      savedItems={savedItems}
      messages={messages}
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email,
        bio: user.bio || "",
        localePreference: user.localePreference || "en",
        tier: user.membership?.tier || "FREE",
        membershipStatus: user.membership?.status || "ACTIVE",
        hasStripeSubscription: !!user.membership?.stripeSubscriptionId,
        hasPassword: !!user.passwordHash,
        connectedProviders: user.accounts.map((a) => a.provider),
        emailNotifications: user.emailNotifications,
        newsletterSubscribed: user.newsletterSubscribed,
        contentPreferences: user.contentPreferences ?? [],
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
