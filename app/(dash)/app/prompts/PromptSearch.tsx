"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

/* Prompts search box — writes the query to the ?q= URL param so PromptsBody can
   filter against it (and the search is shareable / reload-safe). Replaces the
   previously inert input. */
export default function PromptSearch() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";

  function update(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("q", value);
    else next.delete("q");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <input
      type="search"
      aria-label="Search prompts"
      placeholder="⌕ Search prompts…"
      defaultValue={q}
      onChange={(e) => update(e.target.value)}
      style={{ fontSize: "12px", fontWeight: 400, fontVariantNumeric: "tabular-nums", color: "var(--tx)", background: "rgba(255,255,255,0.045)", border: "none", borderRadius: "7px", padding: "6px 12px", width: "200px", fontFamily: "inherit" }}
    />
  );
}
