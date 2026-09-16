"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RunJob } from "@/lib/sampler/job";

/* "Run now" — the manual pull, actually run from this screen.

   This button used to raise a toast saying manual runs are triggered by the
   sampler endpoint and not from here. That stopped being true when the stepped
   run engine landed, so the note was a lie about the product's own capability.

   It now drives the same engine the day-zero welcome screen drives, on the same
   contract (app/(dash)/app/welcome/FirstRun.tsx):

       POST /api/runs/start         freeze the prompt set, create the job
       POST /api/runs/step {jobId}  one unit of work, then return
       GET  /api/runs/status        what this workspace has in flight

   A unit is one prompt across every connected lane, then verification, then
   classification. One short request per unit is what keeps a serverless
   function from holding a multi-minute sample open, and it is what makes the
   progress below real: stage, `doneCount` against the frozen `prompts.length`,
   answers stored and lane errors all come straight off the returned job. No
   number on this screen is composed in the browser.

   On mount it only ASKS whether a job is already running (a reload, a run
   started from the welcome screen) and resumes it. It never starts one by
   itself — a run spends provider credits, so starting it stays a click. */

type Phase = "idle" | "starting" | "running" | "finished" | "error";

/** Cancelled when the screen goes away, so a long loop cannot keep setting
 *  state — and so React's development double-mount leaves no second driver. */
type Token = { cancelled: boolean };

interface Envelope {
  ok?: boolean;
  error?: string;
  job?: RunJob | null;
  done?: boolean;
}

const STAGE_LABEL: Record<RunJob["stage"], string> = {
  sampling: "Asking your prompts",
  verifying: "Checking which answers are about you",
  classifying: "Reading sentiment and topics",
  done: "Run finished",
};

/** Parse a JSON body without throwing on an error page or an empty response. */
async function readJson(res: Response): Promise<Envelope | null> {
  try {
    return (await res.json()) as Envelope;
  } catch {
    return null;
  }
}

/** How far along the job is, in units of work the step endpoint performs:
 *  one per prompt, then verification, then classification. */
function progress(job: RunJob): { units: number; done: number } {
  const total = job.prompts.length;
  const units = total + 2;
  const done =
    job.stage === "sampling"
      ? Math.min(job.doneCount, total)
      : job.stage === "verifying"
        ? total
        : job.stage === "classifying"
          ? total + 1
          : units;
  return { units, done };
}

export default function RunNow({
  connectedLanes,
  promptsTracked,
}: {
  /** answer lanes this deployment has keys for — a run needs at least one */
  connectedLanes: number;
  /** prompts on this workspace — the run has nothing to ask without them */
  promptsTracked: number;
}) {
  const router = useRouter();
  const [job, setJob] = useState<RunJob | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  // The token of the current mount. A loop captures the token it started under,
  // so a loop left over from an unmount can never write to the live screen.
  const tokenRef = useRef<Token>({ cancelled: false });
  const refreshed = useRef(false);

  const fail = useCallback((token: Token, msg: string) => {
    if (token.cancelled) return;
    setError(msg);
    setPhase("error");
  }, []);

  const finish = useCallback(
    (token: Token, done: RunJob) => {
      if (token.cancelled) return;
      setJob(done);
      setPhase("finished");
      // The counts this server component rendered were read before the run.
      // Re-render it so the page stops showing what it knew a minute ago.
      if (!refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
    },
    [router],
  );

  /** One step. Returns the job when the caller should keep going. */
  const step = useCallback(
    async (token: Token, jobId: string): Promise<RunJob | "stop"> => {
      let res: Response;
      try {
        res = await fetch("/api/runs/step", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
      } catch (e) {
        fail(token, e instanceof Error ? e.message : "The connection dropped while the run was going.");
        return "stop";
      }
      const data = await readJson(res);
      if (token.cancelled) return "stop";
      if (!data?.ok || !data.job) {
        fail(token, data?.error ?? `The run could not continue (HTTP ${res.status}).`);
        return "stop";
      }
      setJob(data.job);
      if (data.job.status === "failed") {
        fail(token, data.job.error ?? "The run failed.");
        return "stop";
      }
      if (data.done || data.job.status === "done") {
        finish(token, data.job);
        return "stop";
      }
      return data.job;
    },
    [fail, finish],
  );

  const drive = useCallback(
    async (token: Token, jobId: string) => {
      for (;;) {
        if (token.cancelled) return;
        const next = await step(token, jobId);
        if (next === "stop") return;
      }
    },
    [step],
  );

  // Resume a run already in flight for this workspace — started here before a
  // reload, or from the welcome screen. Read-only: it starts nothing.
  useEffect(() => {
    const token: Token = { cancelled: false };
    tokenRef.current = token;

    void (async () => {
      let existing: RunJob | null = null;
      try {
        const res = await fetch("/api/runs/status", { cache: "no-store" });
        const data = await readJson(res);
        if (data?.ok) existing = data.job ?? null;
      } catch {
        /* status is an optimisation — the button still works without it */
      }
      if (token.cancelled || !existing || existing.status !== "running") return;
      refreshed.current = false;
      setJob(existing);
      setPhase("running");
      await drive(token, existing.id);
    })();

    return () => {
      token.cancelled = true;
    };
  }, [drive]);

  const start = useCallback(async () => {
    const token = tokenRef.current;
    setError(null);
    setJob(null);
    refreshed.current = false;
    setPhase("starting");

    let res: Response;
    try {
      res = await fetch("/api/runs/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
    } catch (e) {
      fail(token, e instanceof Error ? e.message : "Couldn't reach the server to start the run.");
      return;
    }
    const data = await readJson(res);
    if (token.cancelled) return;
    if (!data?.ok || !data.job) {
      fail(token, data?.error ?? `Couldn't start the run (HTTP ${res.status}).`);
      return;
    }
    setJob(data.job);
    if (data.job.status === "failed") {
      fail(token, data.job.error ?? "The run failed.");
      return;
    }
    if (data.job.status === "done") {
      finish(token, data.job);
      return;
    }
    setPhase("running");
    await drive(token, data.job.id);
  }, [drive, fail, finish]);

  const pending = phase === "starting" || phase === "running";
  // Honest gating: the two things a run cannot proceed without, read from the
  // server's own view of this deployment and this workspace.
  const blocked =
    connectedLanes === 0
      ? "No answer engine is connected, so a run has nothing to ask with. Add a provider key in Settings › Integrations."
      : promptsTracked === 0
        ? "This workspace has no tracked prompts yet, so a run has nothing to ask."
        : null;

  /* The live region's text. Every part of it is a field off the job. */
  let statusText: string;
  if (phase === "error") {
    statusText = error ?? "The run stopped.";
  } else if (phase === "idle") {
    statusText = blocked ?? "No run in progress.";
  } else if (!job) {
    statusText = "Starting the run.";
  } else if (job.stage === "sampling") {
    const total = job.prompts.length;
    const n = Math.min(job.doneCount + 1, total);
    const asking = job.prompts[Math.min(job.doneCount, Math.max(0, total - 1))];
    statusText = total === 0 ? "Sampling." : `Prompt ${n} of ${total}${asking ? `: “${asking}”` : ""}`;
  } else if (job.stage === "verifying") {
    statusText = `Checking which of the ${job.answers} collected answer${job.answers === 1 ? "" : "s"} are about this brand.`;
  } else if (job.stage === "classifying") {
    statusText = `Reading sentiment and topics across ${job.answers} answer${job.answers === 1 ? "" : "s"}.`;
  } else {
    statusText = `Run finished — ${job.answers} answer${job.answers === 1 ? "" : "s"} stored${job.errors > 0 ? `, ${job.errors} lane error${job.errors === 1 ? "" : "s"}` : ""}.`;
  }

  const stageLabel = phase === "error" || phase === "idle" ? null : job ? STAGE_LABEL[job.stage] : null;
  const bar = pending && job ? progress(job) : null;
  const barPct = bar && bar.units > 0 ? Math.round((bar.done / bar.units) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px", alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={() => void start()}
        disabled={pending || !!blocked}
        aria-busy={pending || undefined}
        style={{
          fontSize: "12px",
          fontWeight: "500",
          color: "var(--mut)",
          border: "1px solid var(--brd)",
          borderRadius: "7px",
          padding: "8px 14px",
          background: "var(--bg2)",
          cursor: pending || blocked ? "default" : "pointer",
          opacity: pending || blocked ? 0.6 : 1,
          fontFamily: "inherit",
        }}
      >
        {pending ? "Running…" : phase === "error" ? "Try the run again" : phase === "finished" ? "Run again" : "Run now"}
      </button>

      {/* The one live region. Text, never colour alone. */}
      <p
        role="status"
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: "11.5px",
          color: "var(--fnt)",
          maxWidth: "62ch",
          lineHeight: 1.55,
          overflowWrap: "anywhere",
        }}
      >
        {stageLabel ? `${stageLabel} — ${statusText}` : statusText}
      </p>

      {pending && job && job.prompts.length > 0 && (
        <div
          style={{ width: "100%", maxWidth: "340px", height: "4px", borderRadius: "3px", background: "var(--bg2)", overflow: "hidden" }}
          aria-hidden="true"
        >
          <div style={{ height: "100%", width: `${barPct}%`, background: "var(--ac)", borderRadius: "3px" }} />
        </div>
      )}

      {job && (job.answers > 0 || job.errors > 0) && (
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
          {`${job.answers} answer${job.answers === 1 ? "" : "s"} stored`}
          {job.errors > 0 ? ` · ${job.errors} lane error${job.errors === 1 ? "" : "s"}` : ""}
        </div>
      )}

      {pending && (
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", maxWidth: "62ch", lineHeight: 1.55 }}>
          {"Leave this tab open — the run advances one step per request from this screen."}
        </div>
      )}
    </div>
  );
}
