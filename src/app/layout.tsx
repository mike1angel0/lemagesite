import type { Metadata } from "next";

const SITE_URL = process.env.NEXTAUTH_URL || "https://theselenarium.art";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Selenarium — Poetry, Photography & Sound | Mihai Gavrilescu",
    template: "%s — Selenarium",
  },
  description:
    "A digital selenarium for contemporary poetry, photography, music and cinema by lemagepoet (Mihai Gavrilescu). Explore curated collections, essays, and multimedia experiences.",
  authors: [{ name: "Mihai Gavrilescu" }],
  creator: "Mihai Gavrilescu",
  publisher: "Selenarium",
  keywords: [
    "poetry",
    "contemporary poetry",
    "Romanian poetry",
    "photography",
    "fine art photography",
    "music",
    "ambient music",
    "essays",
    "lemagepoet",
    "Mihai Gavrilescu",
    "Selenarium",
  ],
  openGraph: {
    type: "website",
    siteName: "Selenarium",
    locale: "en_US",
    alternateLocale: "ro_RO",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Selenarium — Poetry, Photography & Sound",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@lemagepoet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
