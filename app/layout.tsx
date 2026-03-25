import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Background Remover - Remove Image Background Online",
  description: "Remove image background for free. AI-powered, fast, and easy. No signup required. Download transparent PNG in seconds.",
  keywords: ["background remover", "remove background", "transparent background", "image background remover", "free background remover"],
  openGraph: {
    title: "Free Background Remover - Remove Image Background Online",
    description: "Remove image background for free. AI-powered, fast, and easy. No signup required.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Background Remover",
    description: "Remove image background for free. AI-powered, fast, and easy.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
