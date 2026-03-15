import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminAboutClient } from "./admin-about-client";

export default async function AdminAboutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        startsWith: "about_",
      },
    },
  });

  const data: Record<string, string> = {};
  for (const s of settings) {
    data[s.key] = s.value;
  }

  return <AdminAboutClient initialData={data} />;
}
