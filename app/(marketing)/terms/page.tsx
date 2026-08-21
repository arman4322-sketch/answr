import type { Metadata } from "next";
import LegalDoc from "@/components/marketing/LegalDoc";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated="21 Aug 2026"
      intro="These terms govern your use of Answr. By creating an account or using the service you agree to them. This is a starter agreement — [Company legal entity] should have counsel review it and complete the bracketed items before launch."
      sections={[
        {
          heading: "1. The service",
          body: [
            "Answr provides answer-engine optimization analytics: we sample AI platform answers, track citations and crawler activity, and present metrics and reports. Features and limits vary by plan.",
            "We may update, add, or remove features over time. We aim to give notice of material changes that reduce core functionality.",
          ],
        },
        {
          heading: "2. Accounts",
          body: [
            "You must provide accurate information and are responsible for activity under your account and for keeping your credentials secure. You must be authorized to act for the organization you register.",
            "You are responsible for the brands, domains, and prompts you configure, and for having the rights to monitor them.",
          ],
        },
        {
          heading: "3. Acceptable use",
          body: [
            "Do not misuse the service: no unlawful activity, no attempts to break security or access other customers' data, no reverse engineering except as permitted by law, and no use that violates a third party's rights.",
            "You may not resell or provide the service to third parties except as expressly permitted by your plan.",
          ],
        },
        {
          heading: "4. Fees",
          body: [
            "Paid plans are billed in advance on the cadence shown at checkout and are non-refundable except where required by law. We may change pricing with notice; changes apply at your next renewal.",
            "[Confirm billing provider, currencies, and tax handling.]",
          ],
        },
        {
          heading: "5. Data and privacy",
          body: [
            "Your use of the service is also governed by our Privacy Policy and, where applicable, our Data Processing Addendum. You retain ownership of the data you provide; you grant us the limited license needed to operate the service for you.",
          ],
        },
        {
          heading: "6. Intellectual property",
          body: [
            "The service, including its software and design, is owned by [Company legal entity] and its licensors. These terms grant you a limited, non-exclusive, non-transferable right to use it while your account is active.",
          ],
        },
        {
          heading: "7. Third-party data and platforms",
          body: [
            "Answr relies on third-party AI platforms and data sources. Their availability and output can change without notice; sampled answers approximate what a platform returns and may differ from any individual session. We are not responsible for third-party services.",
          ],
        },
        {
          heading: "8. Warranties and liability",
          body: [
            "The service is provided “as is”, without warranties of any kind to the maximum extent permitted by law. To the extent permitted by law, our aggregate liability is limited to the fees you paid in the 12 months before the claim.",
            "[Confirm limitation-of-liability and indemnity terms with counsel.]",
          ],
        },
        {
          heading: "9. Termination",
          body: [
            "You may cancel at any time. We may suspend or terminate accounts that breach these terms. On termination, your right to use the service ends and we delete workspace data per our Privacy Policy.",
          ],
        },
        {
          heading: "10. Governing law and changes",
          body: [
            "These terms are governed by the laws of [jurisdiction]. We may update them and will post changes here with a new date; continued use means acceptance.",
          ],
        },
      ]}
    />
  );
}
