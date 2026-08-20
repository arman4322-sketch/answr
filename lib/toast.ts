/* Fire the global toast (client-side only — Toaster listens on window). */
export function toast(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("answr:toast", { detail: message }));
  }
}
