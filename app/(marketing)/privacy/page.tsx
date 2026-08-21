import type { Metadata } from "next";
import LegalDoc from "@/components/marketing/LegalDoc";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="21 Aug 2026"
      intro="This policy explains what information Answr collects, why, and the choices you have. Answr is an answer-engine analytics product: the data we process is overwhelmingly about brands and public AI answers, not about individuals. This is a starter policy — [Company legal entity] should have counsel review it and complete the bracketed items before launch."
      sections={[
        {
          heading: "1. Who we are",
          body: [
            "Answr (“we”, “us”) is operated by [Company legal entity], [address]. For any privacy question, contact privacy@answr.io.",
            "For the purposes of the GDPR, we act as a data controller for account and marketing information, and as a data processor for the workspace data you configure us to collect on your behalf (see our DPA).",
          ],
        },
        {
          heading: "2. Information we collect",
          body: [
            "Account information: your name, work email, password (stored only as a salted hash), and workspace settings, provided when you sign up.",
            "Product data you configure: the brands, competitors, prompts, and domains you ask us to track. This is business data, not personal data.",
            "Answer and citation data: answers we sample from AI platforms through their official APIs, and the citations within them. We do not scrape private chat sessions or purchase session logs.",
            "First-party telemetry: when you install our snippet or server integration, we record AI crawler and referral activity on your own properties — the referring hostname, campaign tag, and path. No cookies, no cross-site tracking.",
            "Usage and device information: standard server logs (IP address, browser type, pages viewed) used to operate and secure the service.",
          ],
        },
        {
          heading: "3. How we use information",
          body: [
            "To provide the service — running your prompt set, computing your metrics, and rendering your dashboards.",
            "To secure and improve the service, diagnose problems, and prevent abuse.",
            "To communicate with you about your account, and — where you have opted in — to send product updates. You can unsubscribe at any time.",
            "We do not sell personal information, and we do not use your workspace data to train models.",
          ],
        },
        {
          heading: "4. Legal bases (GDPR)",
          body: [
            "We process account data to perform our contract with you; usage and security data under our legitimate interest in operating a safe service; and marketing communications on the basis of your consent.",
          ],
        },
        {
          heading: "5. Sharing and subprocessors",
          body: [
            "We share data only with the subprocessors required to run the service — our hosting provider, and any model, database, or email providers you connect. A current list is maintained in our DPA, and we announce material changes in advance.",
            "We may disclose information if required by law, or to protect the rights and safety of our users.",
          ],
        },
        {
          heading: "6. Data retention and location",
          body: [
            "Account data is retained for the life of your account and deleted within 30 days of closure. Product and telemetry data are retained per your workspace settings.",
            "Data is stored in the region you select at setup. [Confirm hosting regions.]",
          ],
        },
        {
          heading: "7. Your rights",
          body: [
            "Depending on your location, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. To exercise these rights, email privacy@answr.io.",
            "California residents have additional rights under the CCPA/CPRA, including the right to know and to delete; we do not sell personal information.",
          ],
        },
        {
          heading: "8. Security",
          body: [
            "We serve everything over HTTPS, store passwords only as salted hashes, and restrict access to production data. No system is perfectly secure; report any concern to security@answr.io.",
          ],
        },
        {
          heading: "9. Changes",
          body: [
            "We will post any changes here and update the date above. Material changes will be communicated to account holders.",
          ],
        },
      ]}
    />
  );
}
