import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { newsletterLimiter } from "@/lib/rate-limit";
import { newsletterWelcomeEmail } from "@/lib/email-templates";

const newsletterSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success, remaining } = newsletterLimiter.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await req.json();
    const { email, source } = newsletterSchema.parse(body);

    const existing = await prisma.subscriber.findUnique({ where: { email } });

    if (existing && !existing.unsubscribedAt) {
      return NextResponse.json({ success: true, status: "already_subscribed" });
    }

    await prisma.subscriber.upsert({
      where: { email },
      update: { unsubscribedAt: null, source: source ?? existing?.source },
      create: { email, source },
    });

    if (process.env.RESEND_API_KEY) {
      const senderEmail = process.env.SENDER_EMAIL || process.env.RESEND_FROM_EMAIL || "noreply@theselenarium.art";
      const authorName = process.env.AUTHOR_NAME || "Mihai Gavrilescu";
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: sendError } = await resend.emails.send({
        from: `Selenarium <${senderEmail}>`,
        to: email,
        subject: "Welcome to Selenarium",
        text: `Thank you for subscribing! You'll receive updates on new poetry, photography, essays, and music.\n\nBest,\n${authorName}`,
        html: newsletterWelcomeEmail(authorName, email),
      });
      if (sendError) {
        console.error("Newsletter welcome email error:", sendError);
      }
    }

    return NextResponse.json({ success: true, status: "subscribed" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
