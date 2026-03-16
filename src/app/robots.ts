import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

const BASE_URL = SITE_URL;

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
    host: BASE_URL,
  };
}

// Allow crawlers to discover the RSS feed
// (sitemap already covers pages; RSS is for feed readers)
