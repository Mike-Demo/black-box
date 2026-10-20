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
  waiting: "bg-stone-100 text-stone-600",
  "no-response-yet": "bg-stone-100 text-stone-600",
  outcome: "bg-[#fcf3dc] text-[#77620f]",
  "next-step": "bg-[#e2f3e7] text-[#1e6b41]",
};

export default function InboxEmailView({
  email,
  provider,
  onBack,
  onStatus,
  onRemove,
  onReframed,
}: {
  email: InboxEmail;
  provider?: "local" | "hosted";
  onBack: () => void;
  onStatus: (status: InboxEmailStatus) => void;
  onRemove: () => void;
  onReframed?: () => void;
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
      onReframed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-[0_10px_36px_rgb(87_83_78/0.10)]">
      <button onClick={onBack} className="text-sm text-[#4338ca]">
        ← Back to the vault
      </button>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{email.subject}</h2>
          <p className="mt-0.5 text-sm text-stone-500">
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          The email, word for word
        </h3>
        <blockquote className="mt-1 whitespace-pre-wrap rounded-xl bg-stone-100 p-3 font-mono text-sm">
          {email.body}
        </blockquote>
      </div>

      {!result && (
        <button
          onClick={runReframe}
          disabled={busy}
          className="mt-4 rounded-full border border-stone-300 px-5 py-2 text-sm disabled:opacity-40"
        >
          {busy ? "Reading…" : "Read it in plain words (Gemma reframe)"}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      {result && (
        <div className="mt-5">
          <ReframeResultView result={result} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
        <button
          onClick={() => onStatus("outcome")}
          className="rounded-full bg-[#4338ca] px-4 py-1.5 text-sm font-semibold text-white"
        >
          Mark outcome received
        </button>
        <button
          onClick={() => onStatus("no-response-yet")}
          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm"
        >
          No response yet
        </button>
        <button
          onClick={onRemove}
          className="rounded-full px-3 py-1.5 text-sm text-rose-700"
        >
          Remove from Black Box
        </button>
      </div>
    </section>
  );
}
