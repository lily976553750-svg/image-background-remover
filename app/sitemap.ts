import type { MetadataRoute } from "next";

const siteUrl = "https://bg-remover.xyz";
const lastModified = new Date("2026-07-31T00:00:00.000Z");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
