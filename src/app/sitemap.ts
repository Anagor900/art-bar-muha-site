import type { MetadataRoute } from "next";
import meta from "../../content/site-meta.json";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: meta.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${meta.siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
