import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminAssistant } from "@/components/layout/admin-assistant";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <AdminAssistant />
    </div>
  );
}
