// Anchor → app route map, shared by the converter and all build agents.
// Keys are frame ids from the .dc.html canvases; values are Next.js routes.

export const MARKETING_ROUTES = {
  home: "/",
  pricing: "/pricing",
  feature: "/product/answer-engine-insights",
  "f-citations": "/product/citations",
  "f-conversations": "/product/conversations-demand",
  "f-agents": "/product/agent-analytics",
  "f-actions": "/product/actions-workflows",
  customers: "/customers",
  blog: "/blog",
  "blog-article": "/blog/what-50k-prompts-taught-us",
  about: "/about",
  "s-inhouse": "/solutions/in-house",
  "s-agencies": "/solutions/agencies",
  integrations: "/integrations",
  enterprise: "/enterprise",
  security: "/security",
  // i-nav is a nav open-state mock — folded into the shared Nav component, no route
  "i-saas": "/industries/b2b-saas",
  "i-ecommerce": "/industries/ecommerce",
  "i-fintech": "/industries/fintech",
  "i-healthcare": "/industries/healthcare",
  "i-travel": "/industries/travel",
  casestudy: "/customers/bell-media",
  changelog: "/changelog",
  guide: "/resources/aeo-handbook",
  demo: "/demo",
  index: "/resources/answr-index",
  notfound: "/404-design", // becomes app/not-found.tsx; staged separately
};

export const DASHBOARD_ROUTES = {
  signup: "/signup",
  login: "/login",
  "reset-password": "/reset-password",
  "onboarding-1": "/onboarding/brand",
  "onboarding-2": "/onboarding/competitors",
  "onboarding-3": "/onboarding/prompts",
  "m-empty": "/app/welcome", // day-zero overview
  overview: "/app/overview",
  "m-assets": "/app/assets",
  aei: "/app/insights",
  "p2-regions": "/app/insights/regions",
  "p2-audiences": "/app/insights/audiences",
  "p2-shopping": "/app/insights/shopping",
  "p2-sentiment": "/app/insights/sentiment",
  citations: "/app/citations",
  "m-watched": "/app/citations/watched",
  prompts: "/app/prompts",
  conversations: "/app/conversations",
  demand: "/app/demand",
  "p2-demand": "/app/demand/keyword",
  actions: "/app/actions",
  "p2-action-detail": "/app/actions/92",
  "p2-workflows": "/app/workflows",
  reports: "/app/reports",
  agents: "/app/agents",
  "p2-referrals": "/app/agents/referrals",
  "m-logs": "/app/agents/logs",
  settings: "/app/settings",
  "settings-platforms": "/app/settings/platforms",
  "m-topic": "/app/insights/topics/revenue-forecasting",
  "m-export": "/app/citations", // modal over Citations — integrate as component
  "m-quality": "/app/settings/data-quality",
  "m-bot": "/app/agents/bots/gptbot",
  "m-pagehealth": "/app/page-health",
  "m-alerts": "/app/settings/alerts",
  "m-wizard": "/app/reports", // modal over Reports — integrate as component
  "m-score": "/app/content-score",
  "m-surfaces": "/app/overview", // ⌘K / support chat / what's-new overlays — components
};

export const ALL_ROUTES = { ...MARKETING_ROUTES, ...DASHBOARD_ROUTES };
