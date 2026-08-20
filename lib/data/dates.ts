/* Shared date labels for chart fixtures. The demo workspace's "Last 30 days"
   window is Jul 7 – Aug 5, 2026 (matches every date in the fixture story). */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** n daily labels ending Aug 5, 2026 — the window the filters slice. */
export function lastDays(n: number): string[] {
  const out: string[] = [];
  const end = new Date(2026, 7, 5);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    out.push(`${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return out;
}

/** 30 daily labels ending Aug 5, 2026: ["Jul 7", …, "Aug 5"] */
export function last30Days(): string[] {
  return lastDays(30);
}

/** n weekly labels ending Aug 3, 2026 (Mondays) */
export function lastWeeks(n: number): string[] {
  const out: string[] = [];
  const end = new Date(2026, 7, 3);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i * 7);
    out.push(`${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return out;
}
