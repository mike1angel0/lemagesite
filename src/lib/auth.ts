import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // Auto-create FREE membership for OAuth signups
      if (user.id) {
        await prisma.membership.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id, tier: "FREE", status: "ACTIVE" },
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { membership: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.tier = dbUser.membership?.tier ?? "FREE";
          token.membershipStatus = dbUser.membership?.status ?? "ACTIVE";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.tier = (token.tier as "FREE" | "SUPPORTER" | "PATRON" | "INNER_CIRCLE") ?? "FREE";
        session.user.membershipStatus = (token.membershipStatus as "ACTIVE" | "CANCELLED" | "PAST_DUE" | "EXPIRED") ?? "ACTIVE";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
});
