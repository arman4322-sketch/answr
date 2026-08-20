import type { Metadata } from "next";
import SignupForm from "./SignupForm";
import "./page.css";

/* Sign up — converted from canvas frame #signup.
   Audit fixes applied:
   - "Continue with SSO / SAML" button added (login has it, signup didn't) — cloned
     from login's exact button pair styling.
   - Name fields are empty inputs with "Dana"/"Okafor" as placeholders, not values.
   - Primary CTA uses .btn-ac (dark label on accent).
   The card lives in SignupForm (client): real form submit + OAuth toasts. */

export const metadata: Metadata = {
  title: "Sign up — Answr",
};

export default function SignupPage() {
  return <SignupForm />;
}
