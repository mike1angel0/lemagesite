/**
 * Branded HTML email templates for Selenarium.
 */

const BRAND_COLORS = {
  bg: "#101828",
  cardBg: "#1a2035",
  text: "#e8e0d4",
  muted: "#8a8a8a",
  gold: "#c9a96e",
  border: "#2a3040",
};

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${BRAND_COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_COLORS.bg};">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<!-- Header -->
<tr><td style="text-align:center;padding-bottom:32px;border-bottom:1px solid ${BRAND_COLORS.border};">
<h1 style="margin:0;font-size:24px;font-weight:300;color:${BRAND_COLORS.text};letter-spacing:4px;">SELENARIUM</h1>
</td></tr>
<!-- Content -->
<tr><td style="padding:32px 0;">${content}</td></tr>
<!-- Footer -->
<tr><td style="text-align:center;padding-top:32px;border-top:1px solid ${BRAND_COLORS.border};">
<p style="margin:0;font-size:11px;color:${BRAND_COLORS.muted};letter-spacing:1px;">
&copy; ${new Date().getFullYear()} Selenarium. All rights reserved.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function contactNotificationEmail(data: {
  name: string;
  email: string;
  message: string;
}): string {
  return layout(`
<h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:${BRAND_COLORS.gold};">New Contact Message</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_COLORS.cardBg};border-radius:8px;border:1px solid ${BRAND_COLORS.border};">
<tr><td style="padding:24px;">
<p style="margin:0 0 8px;font-size:12px;color:${BRAND_COLORS.muted};text-transform:uppercase;letter-spacing:2px;">From</p>
<p style="margin:0 0 20px;font-size:15px;color:${BRAND_COLORS.text};">${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p>
<p style="margin:0 0 8px;font-size:12px;color:${BRAND_COLORS.muted};text-transform:uppercase;letter-spacing:2px;">Message</p>
<p style="margin:0;font-size:15px;color:${BRAND_COLORS.text};line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:13px;color:${BRAND_COLORS.muted};">Reply directly to this email to respond to ${escapeHtml(data.name)}.</p>
`);
}

export function makeUnsubscribeUrl(email: string): string {
  const token = Buffer.from(email).toString("base64url");
  const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://theselenarium.art";
  return `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export function newsletterWelcomeEmail(authorName: string, email?: string): string {
  const unsubscribeLink = email
    ? `<p style="margin:24px 0 0;font-size:12px;color:${BRAND_COLORS.muted};text-align:center;">
<a href="${makeUnsubscribeUrl(email)}" style="color:${BRAND_COLORS.muted};text-decoration:underline;">Unsubscribe</a>
</p>`
    : "";

  return layout(`
<h2 style="margin:0 0 16px;font-size:20px;font-weight:400;color:${BRAND_COLORS.text};">Welcome to Selenarium</h2>
<p style="margin:0 0 16px;font-size:15px;color:${BRAND_COLORS.text};line-height:1.7;">
Thank you for subscribing. You'll receive updates on new poetry, photography, essays, and music as they are published.
</p>
<p style="margin:0 0 24px;font-size:15px;color:${BRAND_COLORS.text};line-height:1.7;">
Each piece is crafted with care &mdash; expect quality over quantity.
</p>
<p style="margin:0;font-size:15px;color:${BRAND_COLORS.text};line-height:1.7;">
Warm regards,<br>
<span style="color:${BRAND_COLORS.gold};">${escapeHtml(authorName)}</span>
</p>
${unsubscribeLink}
`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
