import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { contactLimiter } from "@/lib/rate-limit";
import { contactNotificationEmail } from "@/lib/email-templates";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success, remaining } = contactLimiter.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await req.json();
    const data = contactSchema.parse(body);

    if (!process.env.RESEND_API_KEY) {
      console.error("Contact form error: RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact the site administrator." },
        { status: 503 }
      );
    }

    const senderEmail = process.env.SENDER_EMAIL || process.env.RESEND_FROM_EMAIL || "noreply@theselenarium.art";
    const contactEmail = process.env.CONTACT_EMAIL || "hello@mihaiGavrilescu.com";
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: `Selenarium <${senderEmail}>`,
      to: contactEmail,
      subject: `Contact form: ${data.name}`,
      replyTo: data.email,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      html: contactNotificationEmail(data),
    });

    if (sendError) {
      console.error("Contact form send error:", sendError);
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
