"use client";

// The reframe result, rendered the same way everywhere it appears:
//  - the original text, verbatim, first — never replaced;
//  - the model's restatement, labelled as a reframe;
//  - facts split into what the message states / what it does not say;
//  - the inference path (local / hosted demo / mock) disclosed.

import type { ReframeResult } from "@/lib/types";

export function providerLabel(result: ReframeResult): string {
  return result.provider === "local"
    ? `Gemma 4 · Private mode (local — ${result.model})`
    : result.provider === "hosted"
      ? `Gemma 4 · Demo mode (hosted — ${result.model})`
      : "Mock mode — no model was called";
}

export default function ReframeResultView({
  result,
}: {
  result: ReframeResult;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Your original words — untouched
        </h3>
        <blockquote className="mt-1 whitespace-pre-wrap rounded-xl bg-stone-100 p-3 font-mono text-sm">
          {result.original}
        </blockquote>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4338ca]">
            In plain words — same facts, plainer language
          </h3>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-900">
            {providerLabel(result)}
          </span>
        </div>
        <p className="mt-1 text-sm">{result.reframed}</p>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-stone-50 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Known
          </h4>
          <p className="mt-1">{result.facts.decision}</p>
          <ul className="mt-2 list-disc pl-5">
            {result.facts.known.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-stone-50 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Unknown — the message does not say
          </h4>
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
      <p className="text-xs text-stone-400">
        {result.provider === "local"
          ? "Inference ran on this device. Nothing left the machine."
          : result.provider === "hosted"
            ? "Demo mode: the text above was sent to the hosted provider for this one call. The server stored nothing."
            : "Mock mode: placeholder response, no model involved."}
      </p>
    </div>
  );
}
