import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOAuthUrl, exchangeOAuthCode, encryptToken } from "@/lib/social/oauth";
import { randomBytes } from "crypto";

// GET /api/social/oauth/[platform]?action=authorize — redirect to platform OAuth
// GET /api/social/oauth/[platform]?code=...&state=... — callback from platform
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: platformRaw } = await params;
  const platform = platformRaw.toUpperCase();
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mihaigavrilescu.ro";

  // Step 1: Redirect to platform OAuth (requires admin)
  if (action === "authorize") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const state = randomBytes(16).toString("hex");
    const url = getOAuthUrl(platform, state);
    return NextResponse.redirect(url);
  }

  // Step 2: Handle callback (no session check — secured by OAuth code exchange)
  if (code) {
    try {
      const result = await exchangeOAuthCode(platform, code);
      const encryptedAccess = encryptToken(result.accessToken);
      const encryptedRefresh = result.refreshToken
        ? encryptToken(result.refreshToken)
        : null;

      await prisma.socialAccount.upsert({
        where: { platform: platform as "TWITTER" | "FACEBOOK" | "LINKEDIN" | "INSTAGRAM" | "TIKTOK" },
        update: {
          accountName: result.accountName,
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          expiresAt: result.expiresAt,
        },
        create: {
          platform: platform as "TWITTER" | "FACEBOOK" | "LINKEDIN" | "INSTAGRAM" | "TIKTOK",
          accountName: result.accountName,
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          expiresAt: result.expiresAt,
        },
      });

      return NextResponse.redirect(`${baseUrl}/admin/social?connected=${platform.toLowerCase()}`);
    } catch (error) {
      console.error(`OAuth callback error for ${platform}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.redirect(`${baseUrl}/admin/social?error=${encodeURIComponent(message)}`);
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
