import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("hex");
  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

function pledgeToTier(amountCents: number): "FREE" | "SUPPORTER" | "PATRON" | "INNER_CIRCLE" {
  if (amountCents >= 2500) return "INNER_CIRCLE";
  if (amountCents >= 1500) return "PATRON";
  if (amountCents >= 500) return "SUPPORTER";
  return "FREE";
}

export async function POST(req: NextRequest) {
  const secret = process.env.PATREON_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PATREON_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-patreon-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const eventType = req.headers.get("x-patreon-event");
  const body = JSON.parse(rawBody);

  // Parse JSON:API included resources for member email and pledge amount
  const included: Array<Record<string, unknown>> = body.included ?? [];
  const userResource = included.find((r: Record<string, unknown>) => r.type === "user") as
    | { attributes?: { email?: string } }
    | undefined;
  const email = userResource?.attributes?.email;

  const pledgeData = body.data?.attributes;
  const amountCents: number = pledgeData?.pledge_amount_cents ?? pledgeData?.currently_entitled_amount_cents ?? 0;
  const patreonId: string = body.data?.relationships?.user?.data?.id ?? body.data?.id;

  if (!email) {
    console.error("Patreon webhook: no email found in payload");
    return NextResponse.json({ received: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.warn(`Patreon webhook: no user found for email ${email}`);
    return NextResponse.json({ received: true });
  }

  switch (eventType) {
    case "members:pledge:create":
    case "members:pledge:update": {
      const tier = pledgeToTier(amountCents);
      await prisma.membership.upsert({
        where: { userId: user.id },
        update: { tier, status: "ACTIVE", patreonId },
        create: { userId: user.id, tier, status: "ACTIVE", patreonId },
      });
      break;
    }
    case "members:pledge:delete": {
      await prisma.membership.upsert({
        where: { userId: user.id },
        update: { tier: "FREE", status: "CANCELLED" },
        create: { userId: user.id, tier: "FREE", status: "CANCELLED", patreonId },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
