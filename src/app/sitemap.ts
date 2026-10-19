import type { MetadataRoute } from "next";

const BASE = "https://taxmitra.in";
// Fixed build-time reference date keeps the sitemap cacheable; update
// manually when you re-deploy with content changes.
const REF_DATE = new Date("2026-01-01T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { p: "", priority: 1, frequency: "weekly" as const },
    { p: "/itr", priority: 0.9, frequency: "weekly" as const },
    { p: "/tax-saver", priority: 0.9, frequency: "weekly" as const },
    { p: "/loans", priority: 0.8, frequency: "weekly" as const },
    { p: "/gst", priority: 0.8, frequency: "weekly" as const },
    { p: "/ca-marketplace", priority: 0.8, frequency: "weekly" as const },
    { p: "/premium", priority: 0.7, frequency: "monthly" as const },
  ];
  return pages.map(({ p, priority, frequency }) => ({
    url: `${BASE}${p}`,
    lastModified: REF_DATE,
    changeFrequency: frequency,
    priority,
  }));
}
