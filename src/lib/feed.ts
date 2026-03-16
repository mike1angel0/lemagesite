import { SITE_URL } from "@/lib/site-config";

type FeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category: string;
};

type FeedMeta = {
  title: string;
  description: string;
  feedPath: string;
};

const escXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildRssFeed(items: FeedItem[], meta: FeedMeta): string {
  const now = new Date();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escXml(meta.title)}</title>
  <link>${SITE_URL}</link>
  <description>${escXml(meta.description)}</description>
  <language>en</language>
  <lastBuildDate>${now.toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}${meta.feedPath}" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `  <item>
    <title>${escXml(item.title)}</title>
    <link>${item.link}</link>
    <guid isPermaLink="true">${item.link}</guid>
    <description>${escXml(item.description)}</description>
    <pubDate>${item.pubDate}</pubDate>
    <category>${item.category}</category>
  </item>`
  )
  .join("\n")}
</channel>
</rss>`;
}

export function rssResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
