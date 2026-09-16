"use client";

import CommandK from "./CommandK";
import SupportChat from "./SupportChat";

/* Global dashboard overlays — ⌘K palette and support chat.
   Mount once in app/(dash)/app/layout.tsx. */
export default function Overlays() {
  return (
    <>
      <CommandK />
      <SupportChat />
    </>
  );
}
