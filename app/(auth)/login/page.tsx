import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

/* Log in — converted from canvas frame #login.
   Audit fixes applied:
   - "Forgot password?" links to /reset-password (design mistakenly linked #login).
   - Primary CTA uses .btn-ac (dark label on accent).
   Demo credential gate lives in LoginForm (client): dana@nike.com / answr-demo. */

export const metadata: Metadata = {
  title: "Log in — Answr",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
