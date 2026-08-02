import type { Metadata } from "next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const siteUrl = "https://bg-remover.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BG Remover",
    template: "%s",
  },
  description:
    "BG Remover removes image backgrounds online and returns transparent PNG downloads.",
  applicationName: "BG Remover",
  authors: [{ name: "BG Remover" }],
  creator: "BG Remover",
  publisher: "BG Remover",
  keywords: [
    "background remover",
    "remove background",
    "transparent background",
    "image background remover",
    "free background remover",
  ],
  openGraph: {
    title: "BG Remover",
    description:
      "Remove image backgrounds online and download transparent PNGs.",
    url: siteUrl,
    siteName: "BG Remover",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BG Remover",
    description:
      "Remove image backgrounds online and download transparent PNGs.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BG Remover",
  url: siteUrl,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BG Remover",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
