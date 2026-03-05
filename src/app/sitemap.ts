import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.rahulnsanand.com";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    // Later add: /blog, /projects, /about, etc.
  ];
}