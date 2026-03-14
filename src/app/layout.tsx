import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selenarium | LMG",
  description: "Poetry. Photography. Music. Research. Magic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
