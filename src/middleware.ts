import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const AUTH_PROTECTED_PATHS = ["/admin", "/account", "/patron"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip locale prefix (e.g. /en/admin -> /admin)
  const pathWithoutLocale = pathname.replace(/^\/(en|ro)/, "") || "/";

  // Check if path requires auth
  const isProtected = AUTH_PROTECTED_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  if (isProtected) {
    // Check for session token (works with NextAuth JWT strategy)
    const token =
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      const locale = pathname.match(/^\/(en|ro)/)?.[1] || "en";
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run i18n middleware for all requests
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
