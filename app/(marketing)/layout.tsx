import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Toaster from "@/components/ui/Toaster";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg0)", minHeight: "100vh" }}>
      {/* `mkt` scopes components/marketing/marketing.css, the small-screen layer.
          The dashboard reuses the same frame-* wrapper names, so the responsive
          rules must not be able to reach outside the marketing shell. */}
      <div className="mkt" style={{ maxWidth: "1440px", margin: "0 auto" }}>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </div>
  );
}
