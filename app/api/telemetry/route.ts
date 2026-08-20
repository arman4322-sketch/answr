import { NextResponse } from "next/server";
import { summarize } from "@/lib/telemetry";

/* Read side of first-party telemetry — powers /app/live. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await summarize());
}
