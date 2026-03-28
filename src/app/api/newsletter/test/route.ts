import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, previewText, body, fromName } = await req.json();

    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const senderEmail = process.env.SENDER_EMAIL || process.env.RESEND_FROM_EMAIL || "noreply@theselenarium.art";
    const adminEmail = session.user.email;
    if (!adminEmail) {
      return NextResponse.json({ error: "No email address on your account" }, { status: 400 });
    }

    // Simple markdown to HTML for the email
    const htmlBody = body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^### (.+)$/gm, '<h3 style="font-family:Georgia,serif;font-size:18px;color:#E8ECF2;margin:24px 0 8px">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-family:Georgia,serif;font-size:22px;color:#E8ECF2;margin:28px 0 10px">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-family:Georgia,serif;font-size:28px;color:#E8ECF2;margin:32px 0 12px">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#A8B4C8;text-decoration:underline">$1</a>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #1E2738;margin:24px 0">')
      .split("\n")
      .map((line: string) => {
        const t = line.trim();
        if (!t || t.startsWith("<h") || t.startsWith("<hr")) return line;
        return `<p style="margin:0 0 12px;line-height:1.7;color:#7A8599">${line}</p>`;
      })
      .join("\n");

    const html = `
      <div style="background:#0B0E13;padding:32px;font-family:system-ui,sans-serif">
        <div style="max-width:600px;margin:0 auto">
          <div style="text-align:center;border-bottom:1px solid #1E2738;padding-bottom:24px;margin-bottom:24px">
            <p style="font-family:monospace;font-size:10px;letter-spacing:4px;color:#A8B4C8;text-transform:uppercase;margin:0">SELENARIUM</p>
            <p style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#3D4556;margin-top:4px;text-transform:uppercase">TEST EMAIL</p>
          </div>
          ${htmlBody}
          <div style="text-align:center;border-top:1px solid #1E2738;margin-top:32px;padding-top:24px">
            <p style="font-size:11px;color:#3D4556;margin:0">This is a test email. It was not sent to subscribers.</p>
          </div>
        </div>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `${fromName || "Selenarium"} <${senderEmail}>`,
      to: adminEmail,
      subject: `[TEST] ${subject}`,
      html,
      ...(previewText ? { text: previewText } : {}),
    });

    if (error) {
      console.error("Test newsletter send error:", error);
      return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Test newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
