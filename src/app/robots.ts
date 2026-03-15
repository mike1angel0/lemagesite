import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://theselenarium.art";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/signup",
          "/reset-password",
          "/verify-email",
          "/new-password",
          "/account",
          "/patron",
          "/checkout",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
