import type { MetadataRoute } from "next";
import meta from "../../content/site-meta.json";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${meta.siteUrl}/sitemap.xml`,
  };
}
