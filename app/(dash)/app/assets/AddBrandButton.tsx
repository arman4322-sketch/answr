"use client";

import { useState } from "react";
import AddBrandModal from "@/components/app/AddBrandModal";

/* "+ Add brand" — opens the real add-brand form (INTERACTIVITY_CONVENTIONS
   playbook 3: a designed flow exists, so open it instead of toasting). Used in
   the Topbar slot (via `extra`) and in the page header row. Styles unchanged. */
export default function AddBrandButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn-ac"
        onClick={() => setOpen(true)}
        style={{
          fontSize: "12.5px",
          fontWeight: "500",
          borderRadius: "7px",
          padding: "6px 14px",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {"+ Add brand"}
      </button>
      <AddBrandModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
