"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@selenarium.ro";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type AuthState = {
  error?: string;
  success?: boolean;
};

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const resetSchema = z.object({
  email: z.string().email("Invalid email"),
});

const newPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Email Templates ───────────────────────────────────────

function verificationEmailHtml(name: string, url: string) {
  return `
    <div style="background:#0a0f1a;padding:40px 20px;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;">
        <p style="color:#c5a55a;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SELENARIUM</p>
        <h1 style="color:#f5f0e8;font-size:24px;font-weight:300;margin:24px 0 16px;">Verify your email</h1>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;">Hello ${name},</p>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;">Click the button below to verify your email address and activate your Selenarium account.</p>
        <a href="${url}" style="display:inline-block;background:#c5a55a;color:#0a0f1a;padding:12px 32px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;border-radius:4px;margin:24px 0;">VERIFY EMAIL</a>
        <p style="color:#6b7280;font-size:12px;margin-top:32px;">This link expires in 24 hours.</p>
      </div>
    </div>`;
}

function resetPasswordEmailHtml(name: string, url: string) {
  return `
    <div style="background:#0a0f1a;padding:40px 20px;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;">
        <p style="color:#c5a55a;font-size:12px;letter-spacing:3px;text-transform:uppercase;">SELENARIUM</p>
        <h1 style="color:#f5f0e8;font-size:24px;font-weight:300;margin:24px 0 16px;">Reset your password</h1>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;">Hello ${name || "there"},</p>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;">Click the button below to set a new password for your account.</p>
        <a href="${url}" style="display:inline-block;background:#c5a55a;color:#0a0f1a;padding:12px 32px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;border-radius:4px;margin:24px 0;">SET NEW PASSWORD</a>
        <p style="color:#6b7280;font-size:12px;margin-top:32px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>`;
}

// ─── Actions ────────────────────────────────────────────────

export async function signUpAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const token = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.$transaction([
    prisma.user.create({
      data: { name, email, passwordHash },
    }),
    prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    }),
  ]);

  // Create membership for the new user
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.membership.create({
      data: { userId: user.id, tier: "FREE", status: "ACTIVE" },
    });
  }

  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your Selenarium account",
    html: verificationEmailHtml(name, verifyUrl),
  });

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function signInAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: raw.email,
      password: raw.password,
      redirectTo: "/account",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Invalid email or password" };
  }

  return {};
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function resetPasswordAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = { email: formData.get("email") as string };
  const parsed = resetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always show success to prevent email enumeration
  if (!user) {
    return { success: true };
  }

  const token = randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: `reset:${email}`, token, expires },
  });

  const resetUrl = `${BASE_URL}/new-password?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your Selenarium password",
    html: resetPasswordEmailHtml(user.name || "", resetUrl),
  });

  return { success: true };
}

export async function newPasswordAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
  };

  const parsed = newPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { token, password } = parsed.data;

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Invalid or expired token" };
  }

  if (!verificationToken.identifier.startsWith("reset:")) {
    return { error: "Invalid token type" };
  }

  const email = verificationToken.identifier.replace("reset:", "");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: verificationToken.identifier, token } },
  });

  redirect("/login?reset=true");
}

export async function resendVerificationAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    return { success: true }; // Don't reveal account existence
  }

  // Delete old tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your Selenarium account",
    html: verificationEmailHtml(user.name || "", verifyUrl),
  });

  return { success: true };
}
