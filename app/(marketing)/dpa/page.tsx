import type { Metadata } from "next";
import LegalDoc from "@/components/marketing/LegalDoc";

export const metadata: Metadata = { title: "Data Processing Addendum" };

export default function DpaPage() {
  return (
    <LegalDoc
      title="Data Processing Addendum"
      updated="21 Aug 2026"
      intro="This DPA describes how Answr processes personal data on your behalf when you use the service, and forms part of our agreement with you. Enterprise procurement typically reviews this document closely — it is a starter template and [Company legal entity] should have counsel finalize it, complete the subprocessor annex, and confirm the transfer mechanism before signing."
      sections={[
        {
          heading: "1. Roles",
          body: [
            "For personal data contained in workspace data you configure, you are the controller and Answr is the processor. Answr processes such data only on your documented instructions, which include your configuration of the service.",
          ],
        },
        {
          heading: "2. Nature and purpose of processing",
          body: [
            "Answr processes data to provide answer-engine analytics: sampling AI platform answers via official APIs, recording first-party crawler and referral telemetry you send us, computing metrics, and producing reports. The data is predominantly about brands and public answers rather than individuals.",
            "Categories of data subjects and personal data are limited to what appears incidentally in the above (e.g. an IP address in telemetry). Answr does not require or request special-category data.",
          ],
        },
        {
          heading: "3. Subprocessors",
          body: [
            "You authorize Answr to engage the subprocessors listed in the annex below to deliver the service. We impose data-protection obligations on each subprocessor no less protective than this DPA, and we remain responsible for their performance.",
            "We will give advance notice of any new subprocessor and give you the opportunity to object on reasonable data-protection grounds.",
          ],
        },
        {
          heading: "4. Security",
          body: [
            "Answr maintains technical and organizational measures appropriate to the risk, including encryption in transit, access controls on production systems, and hashing of credentials. Measures evolve as the service matures; the current posture is described on our Security page.",
          ],
        },
        {
          heading: "5. International transfers",
          body: [
            "Where processing involves a transfer of personal data across borders, the parties rely on an approved transfer mechanism (e.g. the EU Standard Contractual Clauses). [Confirm mechanism and complete SCC module selection.]",
          ],
        },
        {
          heading: "6. Data subject requests and breach",
          body: [
            "Answr will assist you, taking into account the nature of processing, in responding to data-subject requests and in meeting your security and breach-notification obligations. We will notify you without undue delay after becoming aware of a personal-data breach affecting your data.",
          ],
        },
        {
          heading: "7. Return and deletion",
          body: [
            "On termination, Answr deletes or returns personal data processed on your behalf within 30 days, except where retention is required by law.",
          ],
        },
        {
          heading: "8. Subprocessor annex",
          body: [
            "Vercel — hosting and edge delivery — region: [confirm].",
            "The model, database, email, and storage providers you connect to your workspace become subprocessors when configured. [List each with purpose and region once integrations are live.]",
          ],
        },
      ]}
    />
  );
}
