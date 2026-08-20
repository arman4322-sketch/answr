import type { Metadata } from "next";
import ResetForm from "./ResetForm";

/* Reset password — converted from canvas frame #reset-password.
   Primary CTA uses .btn-ac (audit fix).
   The card lives in ResetForm (client): "Send reset link" swaps the card for an
   inline "check your inbox" confirmation. */

export const metadata: Metadata = {
  title: "Reset password — Answr",
};

export default function ResetPasswordPage() {
  return <ResetForm />;
}
