"use client";

// Reframe panel. Guardrails made visible in the UI:
//  - the user's original text is shown verbatim, first;
//  - the model's restatement is labelled "Reframe — same facts, plainer
//    words" and never replaces the original;
//  - the inference path (local / hosted demo / mock) is disclosed.

import { useState } from "react";
import type { ReframeResult } from "@/lib/types";

export default function ReframePanel({
  provider,
}: {
  provider?: "local" | "hosted";
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
        className="mt-3 rounded-full bg-neutral-900 px-5 py-2 text-sm text-white disabled:opacity-40"
      >
        {busy ? "Reading…" : "Reframe it"}
      </button>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {result && (
        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              The original, word for word
            </h3>
            <blockquote className="mt-1 whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-sm">
              {result.original}
            </blockquote>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Reframe — same facts, plainer words
            </h3>
            <p className="mt-1 text-sm">{result.reframed}</p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-neutral-50 p-3">
              <h4 className="font-medium">What it decided</h4>
              <p className="mt-1">{result.facts.decision}</p>
              <h4 className="mt-3 font-medium">What it states</h4>
              <ul className="mt-1 list-disc pl-5">
                {result.facts.known.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <h4 className="font-medium">What it does not say</h4>
              <ul className="mt-1 list-disc pl-5">
                {result.facts.unknown.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
              {result.facts.nextStep && (
                <>
                  <h4 className="mt-3 font-medium">One factual next step</h4>
                  <p className="mt-1">{result.facts.nextStep}</p>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            Inference:{" "}
            {result.provider === "local"
              ? `local — Gemma (${result.model}) on this device. Nothing left the machine.`
              : result.provider === "hosted"
                ? `Demo mode — hosted Gemma (${result.model}). The text above was sent to the hosting provider for this call.`
                : "Mock mode — no model was called; placeholder response."}
          </p>
        </div>
      )}
    </section>
  );
}
