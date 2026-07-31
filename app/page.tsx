import HomePageClient from "@/components/HomePageClient";
import type { Metadata } from "next";

const siteUrl = "https://bg-remover.xyz";

export const metadata: Metadata = {
  title: "Free Background Remover Online | BG Remover",
  description:
    "Remove image backgrounds online with BG Remover. Upload JPG, PNG, or WebP images up to 10MB and download transparent PNGs with monthly credits.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free Background Remover Online | BG Remover",
    description:
      "Remove image backgrounds online and download transparent PNGs in seconds.",
    url: siteUrl,
    siteName: "BG Remover",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Free Background Remover Online | BG Remover",
    description:
      "Remove image backgrounds online and download transparent PNGs in seconds.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BG Remover",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "AI-powered online background remover for JPG, PNG, and WebP images.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "3 successful background removals per month.",
    },
    {
      "@type": "Offer",
      name: "Starter",
      price: "8.99",
      priceCurrency: "USD",
      description: "25 successful background removals per month.",
    },
    {
      "@type": "Offer",
      name: "Creator",
      price: "19.99",
      priceCurrency: "USD",
      description: "80 successful background removals per month.",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd),
        }}
      />
      <HomePageClient />
    </>
  );
}
