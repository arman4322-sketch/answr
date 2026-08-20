import Toaster from "@/components/ui/Toaster";

/* Auth + onboarding: centered card on the dot-grid ground (no app shell).
   Mounts the global Toaster so auth client components don't each ship one. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg0)",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      {children}
      <Toaster />
    </div>
  );
}
