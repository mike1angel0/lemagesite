import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tierParam = session.metadata?.tier;
      const customerId = session.customer as string;

      if (userId && customerId) {
        let tier: "SUPPORTER" | "PATRON" | "INNER_CIRCLE" = "SUPPORTER";
        if (tierParam === "patron") tier = "PATRON";
        if (tierParam === "inner-circle") tier = "INNER_CIRCLE";

        const subscriptionId = session.subscription as string;

        await prisma.membership.upsert({
          where: { userId },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            tier,
            status: "ACTIVE",
            startedAt: new Date(),
          },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            tier,
            status: "ACTIVE",
            startedAt: new Date(),
          },
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const membership = await prisma.membership.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (membership) {
        const priceId = subscription.items.data[0]?.price.id;
        let tier: "SUPPORTER" | "PATRON" | "INNER_CIRCLE" = "SUPPORTER";
        if (priceId === process.env.STRIPE_PRICE_PATRON) tier = "PATRON";
        if (priceId === process.env.STRIPE_PRICE_INNER_CIRCLE) tier = "INNER_CIRCLE";

        await prisma.membership.update({
          where: { id: membership.id },
          data: {
            tier,
            status: subscription.status === "active" ? "ACTIVE" : "PAST_DUE",
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.membership.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: "CANCELLED", tier: "FREE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
