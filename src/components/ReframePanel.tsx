"use client";

// Reframe panel. Guardrails made visible in the UI:
//  - the user's original text is shown verbatim, first;
//  - the model's restatement is labelled "Reframe — same facts, plainer
//    words" and never replaces the original;
//  - the inference path (local / hosted demo / mock) is disclosed.

import { useState } from "react";
import ReframeResultView from "@/components/ReframeResultView";
import type { ReframeResult } from "@/lib/types";

export default function ReframePanel({
  provider,
  onReframed,
}: {
  provider?: "local" | "hosted";
  onReframed?: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReframeResult | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, provider }),
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
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Read a hard message, calmly</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Paste an outcome notice. Gemma restates it in plainer words and lists
        what it actually says — and what it doesn&apos;t. Your original stays
        on screen, unchanged.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="mt-3 w-full rounded-xl border border-neutral-300 p-3 text-sm"
        placeholder="Paste the message here…"
      />
      <button
        onClick={run}
        disabled={busy || text.trim().length === 0}
        className="mt-3 rounded-full bg-[#0071ec] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Reading…" : "Reframe it"}
      </button>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {result && (
        <div className="mt-5">
          <ReframeResultView result={result} />
        </div>
      )}
    </section>
  );
}
