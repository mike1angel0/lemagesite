import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Simple token verification: base64 of email must match
  const expectedToken = Buffer.from(email).toString("base64url");
  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { email } });

  if (!subscriber) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  if (subscriber.unsubscribedAt) {
    return NextResponse.redirect(new URL("/unsubscribed?already=true", req.url));
  }

  await prisma.subscriber.update({
    where: { email },
    data: { unsubscribedAt: new Date() },
  });

  return NextResponse.redirect(new URL("/unsubscribed", req.url));
}
