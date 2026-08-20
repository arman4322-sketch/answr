import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const SITE_URL = "https://useanswr.com";
const SITE_DESC =
  "Answr monitors what AI assistants say about your brand, traces the citations behind those answers, and turns visibility gaps into a scored action queue.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Answr — The answer engine optimization platform",
    template: "%s · Answr",
  },
  description: SITE_DESC,
  applicationName: "Answr",
  keywords: [
    "answer engine optimization",
    "AEO",
    "AI search visibility",
    "ChatGPT brand monitoring",
    "Perplexity citations",
    "generative engine optimization",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Answr",
    title: "Answr — Know what AI says about your brand",
    description: SITE_DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Answr — Know what AI says about your brand",
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        {/* First-party referral capture (public/snippet.js → /api/collect). Cookieless,
            session-deduped; classifies AI-assistant referrers. Feeds the ai_referrals
            telemetry metric. See INTEGRATIONS.md. */}
        <script defer src="/snippet.js" data-endpoint="/api/collect" />
      </body>
    </html>
  );
}
