import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { getSocialLinks } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialLinks = await getSocialLinks();

  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}
