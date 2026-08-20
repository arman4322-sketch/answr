import Link from "next/link";

/* Solutions sub-nav pills (frames #s-inhouse / #s-agencies) — active tab keeps the
   frame's accent-pill styling; inactive pill keeps the bordered ghost + hv9 hover
   (rule lives in each page's page.css, scoped by the frame wrapper). */

const TABS = [
  { id: "in-house", href: "/solutions/in-house", label: "In-house teams" },
  { id: "agencies", href: "/solutions/agencies", label: "Agencies" },
] as const;

export default function SolutionsTabs({ active }: { active: "in-house" | "agencies" }) {
  return (
    <div style={{ display: "flex", gap: "10px", fontSize: "11.5px" }}>
      {TABS.map((t) =>
        t.id === active ? (
          <Link
            key={t.id}
            href={t.href}
            style={{ fontWeight: "600", color: "#fff", background: "var(--ac)", borderRadius: "6px", padding: "6px 14px" }}
          >
            {t.label}
          </Link>
        ) : (
          <Link
            key={t.id}
            href={t.href}
            style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "6px", padding: "6px 14px" }}
            className="hv9"
          >
            {t.label}
          </Link>
        )
      )}
    </div>
  );
}
