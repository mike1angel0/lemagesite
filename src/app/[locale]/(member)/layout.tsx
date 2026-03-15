import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
