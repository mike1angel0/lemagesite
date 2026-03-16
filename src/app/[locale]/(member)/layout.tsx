import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSocialLinks } from "@/lib/data";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const socialLinks = await getSocialLinks();

  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}
