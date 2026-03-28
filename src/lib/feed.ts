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

// ── Podcast feed types & builder ──────────────────────────────

export type PodcastFeedItem = {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string | null;
  pubDate: string;
  coverImage: string | null;
};

export type PodcastFeedMeta = {
  title: string;
  description: string;
  author: string;
  email: string;
  feedPath: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
};

export function buildPodcastFeed(
  items: PodcastFeedItem[],
  meta: PodcastFeedMeta,
): string {
  const now = new Date();
  const categoryTag = meta.subcategory
    ? `<itunes:category text="${escXml(meta.category)}"><itunes:category text="${escXml(meta.subcategory)}"/></itunes:category>`
    : `<itunes:category text="${escXml(meta.category)}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:itunes="http://www.itunes.apple.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escXml(meta.title)}</title>
  <link>${SITE_URL}</link>
  <description>${escXml(meta.description)}</description>
  <language>en</language>
  <lastBuildDate>${now.toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}${meta.feedPath}" rel="self" type="application/rss+xml"/>
  <itunes:author>${escXml(meta.author)}</itunes:author>
  <itunes:image href="${meta.imageUrl}"/>
  <itunes:explicit>false</itunes:explicit>
  <itunes:owner>
    <itunes:name>${escXml(meta.author)}</itunes:name>
    <itunes:email>${escXml(meta.email)}</itunes:email>
  </itunes:owner>
  ${categoryTag}
${items
  .map(
    (item) => `  <item>
    <title>${escXml(item.title)}</title>
    <description>${escXml(item.description)}</description>
    <enclosure url="${escXml(item.audioUrl)}" length="0" type="audio/mpeg"/>
    <guid isPermaLink="false">${item.id}</guid>
    <pubDate>${item.pubDate}</pubDate>${item.duration ? `\n    <itunes:duration>${escXml(item.duration)}</itunes:duration>` : ""}${item.coverImage ? `\n    <itunes:image href="${escXml(item.coverImage)}"/>` : ""}
  </item>`,
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
