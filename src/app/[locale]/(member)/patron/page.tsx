import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/access";
import { PatronClient } from "./patron-client";

export default async function PatronPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userTier = session.user.tier;
  if (!hasAccess(userTier, "PATRON")) {
    redirect("/membership");
  }

  return <PatronClient />;
}
