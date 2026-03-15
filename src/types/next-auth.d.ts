import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      tier: "FREE" | "SUPPORTER" | "PATRON" | "INNER_CIRCLE";
      membershipStatus: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "EXPIRED";
    } & DefaultSession["user"];
  }
}
