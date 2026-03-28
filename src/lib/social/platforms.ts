import { createHmac, randomBytes } from "crypto";
import { decryptToken } from "./oauth";

interface PostResult {
  postId: string;
  url: string;
}

// OAuth 1.0a signature generation for Twitter
function generateOAuth1Header(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Combine all params for signature base
  const allParams = { ...params, ...oauthParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${encodeRFC3986(k)}=${encodeRFC3986(allParams[k])}`)
    .join("&");

  const signatureBase = `${method.toUpperCase()}&${encodeRFC3986(url)}&${encodeRFC3986(paramString)}`;
  const signingKey = `${encodeRFC3986(consumerSecret)}&${encodeRFC3986(accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeRFC3986(k)}="${encodeRFC3986(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export async function postToTwitter(
  _accessToken: string,
  text: string
): Promise<PostResult> {
  const apiKey = process.env.TWITTER_API_KEY!.trim();
  const apiSecret = process.env.TWITTER_API_SECRET!.trim();
  const accessToken = process.env.TWITTER_ACCESS_TOKEN!.trim();
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET!.trim();

  const url = "https://api.twitter.com/2/tweets";
  const authHeader = generateOAuth1Header(
    "POST",
    url,
    {},
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return {
    postId: data.data.id,
    url: `https://x.com/i/web/status/${data.data.id}`,
  };
}

export async function postToFacebook(
  accessToken: string,
  text: string,
  pageId?: string
): Promise<PostResult> {
  const token = decryptToken(accessToken);
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${token}`
  );
  const pagesData = await pagesRes.json();
  const page = pageId
    ? pagesData.data?.find((p: { id: string }) => p.id === pageId)
    : pagesData.data?.[0];
  if (!page) throw new Error("No Facebook page found");

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${page.id}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        access_token: page.access_token,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API error: ${err}`);
  }
  const data = await res.json();
  return {
    postId: data.id,
    url: `https://www.facebook.com/${data.id}`,
  };
}

export async function postToLinkedIn(
  accessToken: string,
  text: string
): Promise<PostResult> {
  const token = decryptToken(accessToken);
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = await profileRes.json();
  const authorUrn = `urn:li:person:${profile.sub}`;

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API error: ${err}`);
  }
  const data = await res.json();
  const postId = data.id || "";
  return {
    postId,
    url: `https://www.linkedin.com/feed/update/${postId}`,
  };
}

export async function postToInstagram(
  accessToken: string,
  text: string,
  imageUrl?: string
): Promise<PostResult> {
  const token = decryptToken(accessToken);
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=${token}`
  );
  const pagesData = await pagesRes.json();
  const igAccountId = pagesData.data?.[0]?.instagram_business_account?.id;
  if (!igAccountId) throw new Error("No Instagram business account found");

  if (!imageUrl) {
    throw new Error("Instagram requires an image. Generate a text-card image first.");
  }

  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: text,
        access_token: token,
      }),
    }
  );
  const container = await containerRes.json();
  if (!container.id) throw new Error(`Instagram container failed: ${JSON.stringify(container)}`);

  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: token,
      }),
    }
  );
  const published = await publishRes.json();
  return {
    postId: published.id || "",
    url: `https://www.instagram.com/`,
  };
}

export async function postToPlatform(
  platform: string,
  accessToken: string,
  text: string,
  imageUrl?: string
): Promise<PostResult> {
  switch (platform) {
    case "TWITTER":
      return postToTwitter(accessToken, text);
    case "FACEBOOK":
      return postToFacebook(accessToken, text);
    case "LINKEDIN":
      return postToLinkedIn(accessToken, text);
    case "INSTAGRAM":
      return postToInstagram(accessToken, text, imageUrl);
    case "TIKTOK":
      throw new Error("TikTok posting not yet implemented");
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
