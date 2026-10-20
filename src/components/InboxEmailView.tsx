"use client";

// One inbox email, opened inside the vault. The original is shown first,
// verbatim. The Gemma reframe is an optional, labelled second reading —
// it never replaces the original. Status actions use the app's factual
// vocabulary: silence is "No response yet", never spun.

import { useState } from "react";
import ReframeResultView from "@/components/ReframeResultView";
import type { InboxEmail, InboxEmailStatus, ReframeResult } from "@/lib/types";

export const STATUS_LABEL: Record<InboxEmailStatus, string> = {
  waiting: "Waiting",
  "no-response-yet": "No response yet",
  outcome: "Outcome received",
  "next-step": "Next step proposed",
};

export const STATUS_CHIP: Record<InboxEmailStatus, string> = {
  waiting: "bg-neutral-100 text-neutral-600",
  "no-response-yet": "bg-neutral-100 text-neutral-600",
  outcome: "bg-amber-100 text-amber-900",
  "next-step": "bg-green-100 text-green-900",
};

export default function InboxEmailView({
  email,
  provider,
  onBack,
  onStatus,
  onRemove,
}: {
  email: InboxEmail;
  provider?: "local" | "hosted";
  onBack: () => void;
  onStatus: (status: InboxEmailStatus) => void;
  onRemove: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReframeResult | null>(null);

  async function runReframe() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: email.body, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data as ReframeResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <button onClick={onBack} className="text-sm text-[#0071ec]">
        ← Back to the vault
      </button>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{email.subject}</h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            {email.from} · received{" "}
            {new Date(email.receivedAt).toLocaleString()}
            {email.demo && " · demo message"}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CHIP[email.status]}`}
        >
          {STATUS_LABEL[email.status]}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          The email, word for word
        </h3>
        <blockquote className="mt-1 whitespace-pre-wrap rounded-xl bg-neutral-100 p-3 font-mono text-sm">
          {email.body}
        </blockquote>
      </div>

      {!result && (
        <button
          onClick={runReframe}
          disabled={busy}
          className="mt-4 rounded-full border border-neutral-300 px-5 py-2 text-sm disabled:opacity-40"
        >
          {busy ? "Reading…" : "Read it in plain words (Gemma reframe)"}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {result && (
        <div className="mt-5">
          <ReframeResultView result={result} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
        <button
          onClick={() => onStatus("outcome")}
          className="rounded-full bg-[#0071ec] px-4 py-1.5 text-sm font-semibold text-white"
        >
          Mark outcome received
        </button>
        <button
          onClick={() => onStatus("no-response-yet")}
          className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm"
        >
          No response yet
        </button>
        <button
          onClick={onRemove}
          className="rounded-full px-3 py-1.5 text-sm text-red-700"
        >
          Remove from Black Box
        </button>
      </div>
    </section>
  );
}
