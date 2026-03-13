import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // TODO: Verify Patreon webhook signature
  const body = await req.json();
  const eventType = req.headers.get("x-patreon-event");

  switch (eventType) {
    case "members:pledge:create":
    case "members:pledge:update": {
      // TODO: Map Patreon pledge to membership tier
      break;
    }
    case "members:pledge:delete": {
      // TODO: Handle pledge cancellation
      break;
    }
  }

  return NextResponse.json({ received: true });
}
