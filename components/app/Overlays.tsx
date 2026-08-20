"use client";

import CommandK from "./CommandK";
import SupportChat from "./SupportChat";
import WhatsNew from "./WhatsNew";

/* Global dashboard overlays — ⌘K palette, support chat, what's-new panel.
   Mount once in app/(dash)/app/layout.tsx. */
export default function Overlays() {
  return (
    <>
      <CommandK />
      <SupportChat />
      <WhatsNew />
    </>
  );
}
