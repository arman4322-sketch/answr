import type { MetadataRoute } from "next";

/* sitemap.xml (Next.js native) — public marketing routes only. The gated
   dashboard and auth flows are intentionally excluded (see robots.ts).
   Keep this list in sync with the (marketing) route group. */
const SITE = "https://useanswr.com";

const ROUTES: string[] = [
  "/",
  "/pricing",
  "/waitlist",
  "/enterprise",
  "/security",
  "/integrations",
  "/about",
  "/customers",
  "/customers/bell-media",
  "/customers/mty-food-group",
  "/blog",
  "/blog/what-50k-prompts-taught-us",
  "/changelog",
  "/demo",
  "/product/answer-engine-insights",
  "/product/citations",
  "/product/conversations-demand",
  "/product/agent-analytics",
  "/product/actions-workflows",
  "/solutions/in-house",
  "/solutions/agencies",
  "/industries/b2b-saas",
  "/industries/ecommerce",
  "/industries/fintech",
  "/industries/healthcare",
  "/industries/travel",
  "/resources/aeo-handbook",
  "/resources/answr-index",
  "/privacy",
  "/terms",
  "/dpa",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
