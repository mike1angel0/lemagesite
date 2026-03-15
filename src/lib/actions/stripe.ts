"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

const TIER_PRICE_MAP: Record<string, Record<string, string>> = {
  supporter: { monthly: PRICE_IDS.SUPPORTER },
  patron: { monthly: PRICE_IDS.PATRON },
  "inner-circle": { monthly: PRICE_IDS.INNER_CIRCLE },
};

export async function createCheckoutSessionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tier = formData.get("tier") as string;
  const billingCycle = (formData.get("billingCycle") as string) || "monthly";

  const priceId = TIER_PRICE_MAP[tier]?.[billingCycle] || TIER_PRICE_MAP[tier]?.monthly;
  if (!priceId) {
    redirect("/membership");
  }

  // Get or create Stripe customer
  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
  });

  let customerId = membership?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name || undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;

    await prisma.membership.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: {
        userId: session.user.id,
        tier: "FREE",
        status: "ACTIVE",
        stripeCustomerId: customerId,
      },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${BASE_URL}/account?upgraded=true`,
    cancel_url: `${BASE_URL}/membership`,
    metadata: { userId: session.user.id, tier },
  });

  redirect(checkoutSession.url!);
}

export async function createPortalSessionAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
  });

  if (!membership?.stripeCustomerId) {
    redirect("/membership");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: membership.stripeCustomerId,
    return_url: `${BASE_URL}/account`,
  });

  redirect(portalSession.url);
}
