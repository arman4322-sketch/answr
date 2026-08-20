"use client";

import { useEffect, useState } from "react";

/* Global toast — fire with lib/toast's toast("message") from any client code.
   One at a time, bottom-center, auto-dismiss. */

export default function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onToast = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 3600);
    };
    window.addEventListener("answr:toast", onToast);
    return () => {
      window.removeEventListener("answr:toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!msg) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: "22px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--bg2)",
        border: "1px solid var(--brd)",
        borderRadius: "9px",
        boxShadow: "0 18px 48px rgba(0,0,0,.55)",
        padding: "10px 16px",
        fontSize: "12.5px",
        color: "var(--tx)",
        zIndex: 90,
        maxWidth: "440px",
        lineHeight: 1.5,
      }}
    >
      {msg}
    </div>
  );
}
