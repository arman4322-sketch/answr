import type { MetadataRoute } from "next";

/* robots.txt (Next.js native). Public marketing is crawlable; the gated app,
   auth screens and API endpoints are not. Absolute sitemap URL per spec. */
const SITE = "https://useanswr.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/", "/login", "/signup", "/reset-password", "/onboarding/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
