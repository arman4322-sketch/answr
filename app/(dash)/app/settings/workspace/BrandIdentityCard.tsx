import Hint from "@/components/ui/Hint";
import type { BrandIdentity } from "@/lib/brand/identity";
import { fmtDayUTC } from "../states";
import RecheckIdentityButton from "./RecheckIdentityButton";

/* Settings › Workspace — Brand identity.

   Every metric in the product rests on "is this answer about you?". Matching
   the name alone answers "does this string appear?", which is a different
   question whenever the name is shared. This card shows the entity the
   platform actually resolved from the brand name plus the website, the other
   things found publishing under the same name, and the vocabulary used to tell
   them apart.

   Server component. Nothing on it is composed here: it renders the stored
   BrandIdentity (lib/brand/identity, via identityOf in lib/workspace) and two
   counts from the live metrics layer. Fields the profile left empty are
   omitted rather than filled with a plausible example. */

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
  scrollMarginTop: "18px",
};
const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "12px",
  padding: "10px 12px",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "7px",
  fontSize: "12.5px",
};
const labelStyle: React.CSSProperties = { width: "150px", flex: "none", color: "var(--mut)", fontSize: "11.5px" };
const valueStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  color: "var(--tx)",
  fontSize: "12.5px",
  lineHeight: 1.6,
  overflowWrap: "anywhere",
};

const th: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  textAlign: "left",
  paddingBottom: "8px",
};
const td: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--mut)",
  padding: "8px 10px 8px 0",
  borderTop: "1px solid var(--brd)",
  lineHeight: 1.55,
  verticalAlign: "top",
  overflowWrap: "anywhere",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "11.5px",
  fontWeight: 500,
  color: "var(--tx)",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

/** How much of the profile is evidence and how much is inference. */
const SOURCE: Record<BrandIdentity["source"], string> = {
  "site+llm": "Read your website, then profiled with a model",
  llm: "Model only — your website could not be read",
  domain: "Name and domain only — no profile was built",
};

function Chips({ terms, tone }: { terms: string[]; tone: "you" | "other" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "7px" }}>
      {terms.map((t) => (
        <span
          key={t}
          style={{
            fontSize: "11.5px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "5px",
            padding: "4px 9px",
            color: tone === "you" ? "var(--tx)" : "var(--mut)",
            overflowWrap: "anywhere",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function BrandIdentityCard({
  identity,
  nameCollisions,
  answersSampled,
}: {
  identity: BrandIdentity;
  /** answers that named the brand but described a different entity (live metrics) */
  nameCollisions: number;
  /** answers sampled so far — the denominator for the line above */
  answersSampled: number;
}) {
  const conflicts = identity.conflicts;
  const n = conflicts.length;
  // `ambiguous` is set from the conflict list, but read both so the card can
  // never claim a clean name while it is listing namesakes.
  const contested = identity.ambiguous || n > 0;
  const hasVocab = identity.includeTerms.length > 0 || identity.excludeTerms.length > 0;

  return (
    <section id="brand-identity" style={card}>
      <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
        Brand identity
        <Hint text="Which company we count as you" />
      </div>
      <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px", lineHeight: 1.6 }}>
        Resolved from your name and your website. Every mention is checked against this before it counts.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "13px" }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Entity</span>
          <span style={valueStyle}>{identity.name}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Website</span>
          <span style={valueStyle}>{identity.domain || "Not set"}</span>
        </div>
        {identity.description && (
          <div style={rowStyle}>
            <span style={labelStyle}>What it is</span>
            <span style={valueStyle}>{identity.description}</span>
          </div>
        )}
        {identity.category && (
          <div style={rowStyle}>
            <span style={labelStyle}>Category</span>
            <span style={valueStyle}>{identity.category}</span>
          </div>
        )}
        <div style={rowStyle}>
          <span style={labelStyle}>
            How we know
            <Hint text="Where this profile came from" />
          </span>
          <span style={valueStyle}>
            {SOURCE[identity.source]}
            {identity.resolvedAt ? ` · ${fmtDayUTC(identity.resolvedAt)}` : ""}
          </span>
        </div>
        {identity.note && (
          <div style={rowStyle}>
            <span style={labelStyle}>Note</span>
            <span style={{ ...valueStyle, color: "var(--mut)" }}>{identity.note}</span>
          </div>
        )}
      </div>

      {/* Is the name contested? */}
      <div style={{ marginTop: "16px" }}>
        {contested ? (
          <>
            <div style={sectionLabel}>
              The name is shared
              <Hint text="Other companies published under this name" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "4px", lineHeight: 1.6, maxWidth: "72ch" }}>
              {n > 0
                ? `${n} other compan${n === 1 ? "y" : "ies"} publish${n === 1 ? "es" : ""} under this name, so an answer saying “${identity.name}” might be about any of them. Each mention is checked against the profile above before it counts as yours.`
                : `This name is marked as shared, so every mention is checked against the profile above before it counts as yours. No namesake is listed on the profile — re-check the identity to look again.`}
            </div>
            {nameCollisions > 0 && (
              <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "5px", lineHeight: 1.6, maxWidth: "72ch" }}>
                {`So far ${nameCollisions} of the ${answersSampled} answers sampled named ${identity.name} but described one of these, and none of them counted towards your scores.`}
              </div>
            )}
            {n > 0 && (
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginTop: "12px" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: "36%" }}>Site</th>
                    <th style={th}>What it is</th>
                  </tr>
                </thead>
                <tbody>
                  {conflicts.map((c, i) => (
                    <tr key={c.domain ?? `${c.name}-${i}`}>
                      <td style={{ ...td, color: "var(--tx)" }}>
                        {c.domain ? (
                          <a
                            href={`https://${c.domain}`}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            style={{ color: "var(--ac)" }}
                          >
                            {c.domain}
                          </a>
                        ) : (
                          <span style={{ color: "var(--fnt)" }}>{`${c.name} — no site known`}</span>
                      )}
                      </td>
                      <td style={td}>{c.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            <div style={sectionLabel}>
              The name is not shared
              <Hint text="Nothing else found using this name" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "4px", lineHeight: 1.6, maxWidth: "72ch" }}>
              {`Nothing else was found publishing under “${identity.name}”, so there is nobody to confuse you with — every answer that names you counts as a mention of you.`}
            </div>
          </>
        )}
      </div>

      {/* The vocabulary the matcher uses to tell them apart. */}
      {hasVocab && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {identity.includeTerms.length > 0 && (
            <div>
              <div style={sectionLabel}>
                Words that mean you
                <Hint text="Seeing these makes an answer yours" />
              </div>
              <Chips terms={identity.includeTerms} tone="you" />
            </div>
          )}
          {identity.excludeTerms.length > 0 && (
            <div>
              <div style={sectionLabel}>
                Words that mean someone else
                <Hint text="Seeing these points at a namesake" />
              </div>
              <Chips terms={identity.excludeTerms} tone="other" />
            </div>
          )}
        </div>
      )}

      <RecheckIdentityButton />
    </section>
  );
}
