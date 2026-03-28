import { randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.SOCIAL_ENCRYPTION_KEY;
  if (!key) throw new Error("SOCIAL_ENCRYPTION_KEY is not set");
  return Buffer.from(key, "hex");
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// PKCE helpers for Twitter OAuth 2.0
// We use a fixed verifier per deployment since we can't store state between
// the authorize redirect and callback in a stateless serverless function.
// This is acceptable because the state param prevents CSRF, and the verifier
// just proves the same client initiated the flow.
function getCodeVerifier(): string {
  // Deterministic but unpredictable verifier derived from encryption key
  const key = process.env.SOCIAL_ENCRYPTION_KEY!;
  return createHash("sha256").update(`pkce-verifier-${key}`).digest("base64url").slice(0, 64);
}

function getCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function getCallbackUrl(platform: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mihaigavrilescu.ro";
  return `${baseUrl}/api/social/oauth/${platform.toLowerCase()}`;
}

// OAuth URL builders per platform
export function getOAuthUrl(platform: string, state: string): string {
  const callbackUrl = getCallbackUrl(platform);

  switch (platform) {
    case "TWITTER": {
      const clientId = process.env.TWITTER_CLIENT_ID!;
      const codeVerifier = getCodeVerifier();
      const codeChallenge = getCodeChallenge(codeVerifier);
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: "tweet.read tweet.write users.read offline.access",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });
      return `https://twitter.com/i/oauth2/authorize?${params}`;
    }
    case "FACEBOOK": {
      const appId = process.env.FACEBOOK_APP_ID!;
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: callbackUrl,
        scope: "public_profile,email",
        state,
      });
      return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
    }
    case "LINKEDIN": {
      const clientId = process.env.LINKEDIN_CLIENT_ID!;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: "openid profile w_member_social",
        state,
      });
      return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    }
    case "INSTAGRAM": {
      const appId = process.env.FACEBOOK_APP_ID!;
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: callbackUrl,
        scope: "instagram_basic,instagram_content_publish",
        response_type: "code",
        state,
      });
      return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
    }
    case "TIKTOK": {
      const clientKey = process.env.TIKTOK_CLIENT_KEY!;
      const params = new URLSearchParams({
        client_key: clientKey,
        scope: "video.publish",
        response_type: "code",
        redirect_uri: callbackUrl,
        state,
      });
      return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
    }
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

export async function exchangeOAuthCode(
  platform: string,
  code: string
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date; accountName: string }> {
  const callbackUrl = getCallbackUrl(platform);

  switch (platform) {
    case "TWITTER": {
      const codeVerifier = getCodeVerifier();
      const clientId = process.env.TWITTER_CLIENT_ID!.trim();
      const clientSecret = process.env.TWITTER_CLIENT_SECRET!.trim();
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: callbackUrl,
          code_verifier: codeVerifier,
        }),
      });
      const data = await res.json();
      if (!data.access_token) {
        throw new Error(`Twitter token exchange failed: ${JSON.stringify(data)}`);
      }
      // Get username
      const userRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const userData = await userRes.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        accountName: `@${userData.data?.username || "unknown"}`,
      };
    }
    case "FACEBOOK": {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(callbackUrl)}`
      );
      const data = await res.json();
      const meRes = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${data.access_token}`);
      const me = await meRes.json();
      return {
        accessToken: data.access_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        accountName: me.name || "Facebook Page",
      };
    }
    case "LINKEDIN": {
      const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: callbackUrl,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      });
      const data = await res.json();
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const profile = await profileRes.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        accountName: profile.name || "LinkedIn",
      };
    }
    case "INSTAGRAM": {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(callbackUrl)}`
      );
      const data = await res.json();
      return {
        accessToken: data.access_token,
        accountName: "Instagram",
      };
    }
    case "TIKTOK": {
      const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code,
          grant_type: "authorization_code",
          redirect_uri: callbackUrl,
        }),
      });
      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        accountName: "TikTok",
      };
    }
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
