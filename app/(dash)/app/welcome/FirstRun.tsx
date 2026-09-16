"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* The first pull, started the moment this screen mounts.

   The user's complaint was the whole of the old behaviour: onboarding finished
   and the screen said the run "starts tonight", which was not true of anything
   — there was no schedule for a new account and no email to announce it. The
   only control ("Run now instead") raised a toast and ran nothing.

   Now the screen runs it. On mount this component asks whether a job is already
   in flight for THIS workspace (GET /api/runs/status) and resumes it; otherwise
   it starts one (POST /api/runs/start) and then drives it a step at a time
   (POST /api/runs/step), each step being one prompt sampled across every
   connected lane, or the verification stage, or the classification stage. One
   short request per unit of work is what keeps a serverless function from
   having to hold a multi-minute sample open.

   Everything rendered comes back from the job: the stage, `doneCount` against
   `prompts.length`, the prompt currently being asked, the answers stored and
   the lane errors. The lane names are the deployment's real configured
   providers, passed down from the server component. No number here is composed
   in the browser. */

export interface RunJob {
  id: string;
  workspaceId: string;
  status: "running" | "done" | "failed";
  stage: "sampling" | "verifying" | "classifying" | "done";
  prompts: string[];
  doneCount: number;
  answers: number;
  errors: number;
  startedAt: number;
  finishedAt?: number;
  error?: string;
}

type Phase = "starting" | "running" | "finished" | "error";

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

export default function FirstRun({
  brand,
  lanes,
  promptCount,
}: {
  /** the configured brand — used only in sentences about it */
  brand: string;
  /** labels of the answer lanes this deployment has keys for */
  lanes: string[];
  /** tracked prompts on the workspace, for the line shown before the job exists */
  promptCount: number;
}) {
  const router = useRouter();
  const [job, setJob] = useState<RunJob | null>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const navigated = useRef(false);

  useEffect(() => {
    // Cancelled on unmount so a long loop cannot keep setting state — and so
    // React's development double-mount does not leave two loops running.
    const token = { cancelled: false };

    const fail = (msg: string) => {
      if (token.cancelled) return;
      setError(msg);
      setPhase("error");
    };

    /** One step. Returns the job when the caller should keep going. */
    async function step(jobId: string): Promise<RunJob | "stop"> {
      let res: Response;
      try {
        res = await fetch("/api/runs/step", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
      } catch (e) {
        fail(e instanceof Error ? e.message : "The connection dropped while the run was going.");
        return "stop";
      }
      const data = await readJson(res);
      if (token.cancelled) return "stop";
      if (!data?.ok || !data.job) {
        fail(data?.error ?? `The run could not continue (HTTP ${res.status}).`);
        return "stop";
      }
      setJob(data.job);
      if (data.job.status === "failed") {
        fail(data.job.error ?? "The run failed.");
        return "stop";
      }
      if (data.done || data.job.status === "done") {
        finish(data.job);
        return "stop";
      }
      return data.job;
    }

    function finish(done: RunJob) {
      if (token.cancelled) return;
      setPhase("finished");
      // Only send someone to the dashboard when the run actually produced
      // something to look at. A run that stored nothing says so instead.
      if (done.answers > 0 && !navigated.current) {
        navigated.current = true;
        router.replace("/app/overview");
      }
    }

    async function drive(jobId: string) {
      for (;;) {
        if (token.cancelled) return;
        const next = await step(jobId);
        if (next === "stop") return;
      }
    }

    void (async () => {
      setError(null);
      setPhase("starting");

      // Resume rather than start a second run — the person may have reloaded.
      let existing: RunJob | null = null;
      try {
        const res = await fetch("/api/runs/status", { cache: "no-store" });
        const data = await readJson(res);
        if (data?.ok) existing = data.job ?? null;
      } catch {
        /* status is an optimisation; falling through starts a run instead */
      }
      if (token.cancelled) return;

      if (existing && existing.status === "running") {
        setJob(existing);
        setPhase("running");
        await drive(existing.id);
        return;
      }
      // A finished job is only worth reporting on the first pass. Pressing
      // "Try the run again" must reach /api/runs/start and begin a new one,
      // not re-read the same finished record forever.
      if (existing && existing.status === "done" && attempt === 0) {
        setJob(existing);
        finish(existing);
        return;
      }

      let res: Response;
      try {
        res = await fetch("/api/runs/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        });
      } catch (e) {
        fail(e instanceof Error ? e.message : "Couldn't reach the server to start the run.");
        return;
      }
      const data = await readJson(res);
      if (token.cancelled) return;
      if (!data?.ok || !data.job) {
        fail(data?.error ?? `Couldn't start the run (HTTP ${res.status}).`);
        return;
      }
      setJob(data.job);
      if (data.job.status === "failed") {
        fail(data.job.error ?? "The run failed.");
        return;
      }
      if (data.job.status === "done") {
        finish(data.job);
        return;
      }
      setPhase("running");
      await drive(data.job.id);
    })();

    return () => {
      token.cancelled = true;
    };
  }, [attempt, router]);

  const total = job ? job.prompts.length : promptCount;
  const bar = job ? progress(job) : null;
  const barPct = bar && bar.units > 0 ? Math.round((bar.done / bar.units) * 100) : 0;

  /* The live region's text. Every part of it is a field off the job. */
  let statusText: string;
  if (phase === "error") {
    statusText = error ?? "The run stopped.";
  } else if (!job) {
    statusText = `Starting your first run — ${total} prompt${total === 1 ? "" : "s"} to ask.`;
  } else if (job.stage === "sampling") {
    const n = Math.min(job.doneCount + 1, total);
    const asking = job.prompts[Math.min(job.doneCount, Math.max(0, total - 1))];
    statusText = total === 0 ? "Sampling." : `Prompt ${n} of ${total}${asking ? `: “${asking}”` : ""}`;
  } else if (job.stage === "verifying") {
    statusText = `Checking which of the ${job.answers} collected answer${job.answers === 1 ? "" : "s"} are about ${brand}.`;
  } else if (job.stage === "classifying") {
    statusText = `Reading sentiment and topics across ${job.answers} answer${job.answers === 1 ? "" : "s"}.`;
  } else {
    statusText = `Run finished — ${job.answers} answer${job.answers === 1 ? "" : "s"} stored.`;
  }

  // Before a job exists there is no stage to name, so the line is the status on
  // its own rather than "Starting — Starting…".
  const stageLabel = phase === "error" ? null : job ? STAGE_LABEL[job.stage] : null;
  const pending = phase === "starting" || phase === "running";
  const emptyFinish = phase === "finished" && !!job && job.answers === 0;

  return (
    <div
      style={{
        border: "1px dashed var(--brd)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        textAlign: "center",
        padding: "32px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "rgba(142,124,242,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ac)",
          fontSize: "17px",
          fontWeight: 700,
        }}
        aria-hidden="true"
      >
        {phase === "error" ? "!" : phase === "finished" ? "✓" : "▶"}
      </div>

      <div style={{ fontSize: "15px", fontWeight: 600 }}>
        {phase === "error"
          ? "The run stopped"
          : phase === "finished"
            ? emptyFinish
              ? "The run finished with nothing stored"
              : "Run finished — opening your dashboard"
            : "Running your first pull now"}
      </div>

      {/* The one live region. Text, never colour alone. */}
      <p
        role="status"
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: "12.5px",
          color: "var(--mut)",
          maxWidth: "420px",
          lineHeight: 1.6,
          overflowWrap: "anywhere",
        }}
      >
        {stageLabel ? `${stageLabel} — ${statusText}` : statusText}
      </p>

      {pending && total > 0 && (
        <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ height: "4px", borderRadius: "3px", background: "var(--bg2)", overflow: "hidden" }} aria-hidden="true">
            <div className="wl-bar" style={{ height: "100%", width: `${barPct}%`, background: "var(--ac)", borderRadius: "3px" }} />
          </div>
        </div>
      )}

      {lanes.length > 0 && phase !== "error" && (
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", maxWidth: "420px", lineHeight: 1.55 }}>
          {`Each prompt is asked of ${lanes.length} connected lane${lanes.length === 1 ? "" : "s"}: ${lanes.join(", ")}.`}
        </div>
      )}

      {job && (job.answers > 0 || job.errors > 0) && (
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
          {`${job.answers} answer${job.answers === 1 ? "" : "s"} stored`}
          {job.errors > 0 ? ` · ${job.errors} lane error${job.errors === 1 ? "" : "s"}` : ""}
        </div>
      )}

      {pending && (
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", maxWidth: "420px", lineHeight: 1.55 }}>
          {"Leave this tab open — the run advances one step per request from this screen."}
        </div>
      )}

      {emptyFinish && (
        <div style={{ fontSize: "12.5px", color: "var(--mut)", maxWidth: "420px", lineHeight: 1.6 }}>
          {job && job.errors > 0
            ? `Every lane returned an error, so there is nothing to show yet. Check your provider keys and run it again.`
            : "No answers came back, so there is nothing to show yet."}
        </div>
      )}

      {(phase === "error" || emptyFinish) && (
        <button
          type="button"
          className="btn-ac"
          onClick={() => setAttempt((a) => a + 1)}
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            borderRadius: "7px",
            padding: "8px 18px",
            marginTop: "4px",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {"Try the run again"}
        </button>
      )}

      {pending && (
        <button
          type="button"
          className="btn-ac"
          disabled
          aria-busy="true"
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            borderRadius: "7px",
            padding: "8px 18px",
            marginTop: "4px",
            border: "none",
            cursor: "default",
            fontFamily: "inherit",
            opacity: 0.6,
          }}
        >
          {"Running…"}
        </button>
      )}

      {phase === "finished" && !emptyFinish && (
        <Link
          href="/app/overview"
          className="btn-ac"
          style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "8px 18px", marginTop: "4px", display: "inline-block" }}
        >
          {"Open your dashboard →"}
        </Link>
      )}

      {phase === "error" && (
        <Link href="/app/settings/integrations" style={{ fontSize: "11.5px", color: "var(--ac)" }}>
          {"Check your connected engines"}
        </Link>
      )}
    </div>
  );
}
